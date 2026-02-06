/**
 * YouTubeいいね同期のコアロジック
 * Server Actionとバッチスクリプトのどちらからでもimportできるよう、"server-only"を付けない
 */

import { createAdminClient } from "@/lib/supabase/adminClient";
import { hasTeamMiraiTag } from "../constants/team-mirai";
import {
  buildLikeVideoRecord,
  filterNewIds,
  mapLikedVideoItem,
} from "../utils/sync-helpers";
import {
  fetchUserLikedVideos as fetchUserLikedVideosRaw,
  fetchVideoDetails,
} from "./youtube-client";

/**
 * いいねした動画の情報
 */
export interface LikedVideo {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl?: string;
  publishedAt: string;
}

/**
 * ユーザーがいいねした動画一覧を取得する
 * @param accessToken OAuth アクセストークン
 * @param maxResults 取得する最大件数（デフォルト50）
 */
export async function fetchUserLikedVideos(
  accessToken: string,
  maxResults = 50,
): Promise<LikedVideo[]> {
  const rawItems = await fetchUserLikedVideosRaw(accessToken, maxResults);

  return rawItems.map(mapLikedVideoItem);
}

/**
 * 複数の動画がチームみらいの動画かどうかを一括チェックする
 * APIクォータ節約のため、DBに存在しない動画をまとめてAPIで取得
 * @param videoIds YouTube動画IDの配列
 * @param accessToken YouTube APIアクセストークン（オプション）
 */
export async function checkTeamMiraiVideosBatch(
  videoIds: string[],
  accessToken?: string,
): Promise<Map<string, { isTeamMirai: boolean; videoUrl?: string }>> {
  const results = new Map<
    string,
    { isTeamMirai: boolean; videoUrl?: string }
  >();

  if (videoIds.length === 0) {
    return results;
  }

  const adminClient = await createAdminClient();

  // 1. DBに存在する動画を一括チェック
  const { data: dbVideos } = await adminClient
    .from("youtube_videos")
    .select("video_id, video_url")
    .in("video_id", videoIds)
    .eq("is_active", true);

  const dbVideoMap = new Map(
    (dbVideos || []).map((v) => [v.video_id, v.video_url]),
  );

  // DBに存在する動画を結果に追加
  for (const videoId of videoIds) {
    if (dbVideoMap.has(videoId)) {
      results.set(videoId, {
        isTeamMirai: true,
        videoUrl: dbVideoMap.get(videoId) ?? undefined,
      });
    }
  }

  // 2. DBに存在しない動画をAPIでチェック
  const notInDbVideoIds = videoIds.filter((id) => !dbVideoMap.has(id));

  if (notInDbVideoIds.length > 0 && accessToken) {
    try {
      // 一括でAPIから取得
      const details = await fetchVideoDetails(accessToken, notInDbVideoIds);

      for (const detail of details) {
        if (
          hasTeamMiraiTag(
            detail.snippet.tags,
            detail.snippet.title,
            detail.snippet.description,
            detail.snippet.channelTitle,
          )
        ) {
          results.set(detail.id, {
            isTeamMirai: true,
            videoUrl: `https://www.youtube.com/watch?v=${detail.id}`,
          });
        }
      }
    } catch (error) {
      console.error(
        "Failed to fetch video details from YouTube API (batch):",
        error,
      );
    }
  }

  // 結果にない動画はチームみらい動画ではない
  for (const videoId of videoIds) {
    if (!results.has(videoId)) {
      results.set(videoId, { isTeamMirai: false });
    }
  }

  return results;
}

/**
 * ユーザーが既にいいね記録済みの動画IDセットを取得する
 * @param userId ユーザーID
 */
export async function getUserRecordedLikes(
  userId: string,
): Promise<Set<string>> {
  const adminClient = await createAdminClient();

  const { data: likes } = await adminClient
    .from("youtube_video_likes")
    .select("video_id")
    .eq("user_id", userId);

  return new Set((likes || []).map((l) => l.video_id));
}

/**
 * YouTubeいいね記録を作成する
 * @param userId ユーザーID
 * @param videoId YouTube動画ID
 * @param missionArtifactId 関連する成果物ID
 */
export async function createYouTubeLikeRecord(
  userId: string,
  videoId: string,
  missionArtifactId: string,
): Promise<{ success: boolean; error?: string }> {
  const adminClient = await createAdminClient();

  const { error } = await adminClient.from("youtube_video_likes").insert({
    user_id: userId,
    video_id: videoId,
    mission_artifact_id: missionArtifactId,
  });

  if (error) {
    // 重複エラーの場合は成功として扱う
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Failed to create YouTube like record:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * ユーザー単位のいいね同期結果
 */
export interface SyncLikesForUserResult {
  success: boolean;
  syncedVideoCount: number;
  achievedCount: number;
  totalXpGranted: number;
  error?: string;
}

/**
 * 特定ユーザーのYouTubeいいねを同期する
 * バッチ処理とServer Actionの両方から呼び出される共通ロジック
 * @param userId ユーザーID
 * @param accessToken 有効なアクセストークン（事前にリフレッシュ済み）
 */
export async function syncLikesForUser(
  userId: string,
  accessToken: string,
): Promise<SyncLikesForUserResult> {
  const adminClient = await createAdminClient();

  // 1. ユーザーがいいねした動画を取得
  let likedVideos: LikedVideo[];
  try {
    likedVideos = await fetchUserLikedVideos(accessToken, 100);
  } catch (error) {
    console.error(`Failed to fetch liked videos for user ${userId}:`, error);
    return {
      success: false,
      syncedVideoCount: 0,
      achievedCount: 0,
      totalXpGranted: 0,
      error: "いいねした動画の取得に失敗しました",
    };
  }

  // 2. チームみらい動画を一括チェック
  const videoIds = likedVideos.map((v) => v.videoId);
  const teamMiraiResults = await checkTeamMiraiVideosBatch(
    videoIds,
    accessToken,
  );

  // 3. チームみらい動画のうち、youtube_videosにないものを取得
  const teamMiraiVideoIds = Array.from(teamMiraiResults.entries())
    .filter(([_, result]) => result.isTeamMirai)
    .map(([videoId]) => videoId);

  if (teamMiraiVideoIds.length === 0) {
    return {
      success: true,
      syncedVideoCount: 0,
      achievedCount: 0,
      totalXpGranted: 0,
    };
  }

  // 4. 既にyoutube_videosにある動画を取得
  const { data: existingVideos } = await adminClient
    .from("youtube_videos")
    .select("video_id")
    .in("video_id", teamMiraiVideoIds);

  const existingVideoIds = new Set(
    (existingVideos || []).map((v) => v.video_id),
  );

  const newVideoIds = filterNewIds(teamMiraiVideoIds, existingVideoIds);

  // 5. 新しい動画をyoutube_videosに追加
  let syncedVideoCount = 0;
  if (newVideoIds.length > 0) {
    const videoDetails = await fetchVideoDetails(accessToken, newVideoIds);

    for (const detail of videoDetails) {
      const { error: insertError } = await adminClient
        .from("youtube_videos")
        .upsert(buildLikeVideoRecord(detail), {
          onConflict: "video_id",
          ignoreDuplicates: true,
        });

      if (!insertError) {
        syncedVideoCount++;
      }
    }
  }

  // 6. YouTubeミッションを取得
  const { data: youtubeMission } = await adminClient
    .from("missions")
    .select("id")
    .eq("slug", "youtube-like")
    .single();

  if (!youtubeMission) {
    return {
      success: true,
      syncedVideoCount,
      achievedCount: 0,
      totalXpGranted: 0,
      error: "YouTubeミッションが見つかりません",
    };
  }

  // 7. 既に記録済みのいいねを取得
  const recordedLikes = await getUserRecordedLikes(userId);

  // 8. 未記録のチームみらい動画を抽出
  const unrecordedLikes = teamMiraiVideoIds.filter(
    (videoId) => !recordedLikes.has(videoId),
  );

  if (unrecordedLikes.length === 0) {
    return {
      success: true,
      syncedVideoCount,
      achievedCount: 0,
      totalXpGranted: 0,
    };
  }

  // 9. 未記録のいいねをミッション達成として記録
  let achievedCount = 0;
  let totalXpGranted = 0;

  // XP付与のためのインポート
  const { grantMissionCompletionXp } = await import(
    "@/features/user-level/services/level"
  );
  const { getCurrentSeasonId } = await import("@/lib/services/seasons");

  const currentSeasonId = await getCurrentSeasonId();
  if (!currentSeasonId) {
    return {
      success: false,
      syncedVideoCount,
      achievedCount: 0,
      totalXpGranted: 0,
      error: "現在のシーズンが見つかりません",
    };
  }

  for (const videoId of unrecordedLikes) {
    try {
      const videoUrl =
        teamMiraiResults.get(videoId)?.videoUrl ||
        `https://www.youtube.com/watch?v=${videoId}`;

      // achievement作成
      const { data: achievement, error: achievementError } = await adminClient
        .from("achievements")
        .insert({
          user_id: userId,
          mission_id: youtubeMission.id,
          season_id: currentSeasonId,
        })
        .select("id")
        .single();

      if (achievementError || !achievement) {
        console.error(
          `Failed to create achievement: ${achievementError?.message}`,
        );
        continue;
      }

      // mission_artifact作成
      const { data: artifact, error: artifactError } = await adminClient
        .from("mission_artifacts")
        .insert({
          achievement_id: achievement.id,
          user_id: userId,
          artifact_type: "YOUTUBE",
          link_url: videoUrl,
          image_storage_path: null,
          text_content: null,
        })
        .select("id")
        .single();

      if (artifactError || !artifact) {
        console.error(`Failed to create artifact: ${artifactError?.message}`);
        continue;
      }

      // youtube_video_likesに記録
      const likeResult = await createYouTubeLikeRecord(
        userId,
        videoId,
        artifact.id,
      );

      if (!likeResult.success) {
        continue;
      }

      // XP付与
      const xpResult = await grantMissionCompletionXp(
        userId,
        youtubeMission.id,
        achievement.id,
      );

      achievedCount++;
      totalXpGranted += xpResult.xpGranted || 0;
    } catch (error) {
      console.error(`Error recording like for video ${videoId}:`, error);
    }
  }

  return {
    success: true,
    syncedVideoCount,
    achievedCount,
    totalXpGranted,
  };
}
