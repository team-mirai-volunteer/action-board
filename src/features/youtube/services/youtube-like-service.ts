import "server-only";

import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createAdminClient } from "@/lib/supabase/adminClient";
import type { YouTubeVideoDetail } from "./youtube-client";
import { fetchUserLikedVideos } from "./youtube-client";
import {
  filterTeamMiraiVideos,
  saveYouTubeVideo,
} from "./youtube-video-service";

/**
 * YouTubeいいね同期結果
 */
export interface YouTubeLikeSyncResult {
  success: boolean;
  newAchievements: number;
  alreadyAchieved: number;
  notTeamMirai: number;
  error?: string;
}

/**
 * 手動登録結果
 */
export interface ManualLikeResult {
  success: boolean;
  isNewAchievement: boolean;
  error?: string;
}

/**
 * チームみらい動画かどうかを判定
 * 条件: youtube_videosに存在 OR #チームみらいタグあり
 */
export async function isTeamMiraiVideo(
  videoId: string,
  videoDetail?: YouTubeVideoDetail,
): Promise<{ isTeamMirai: boolean; youtubeVideoId?: string }> {
  const supabase = await createAdminClient();

  // 1. まずyoutube_videosテーブルで検索
  const { data: existingVideo } = await supabase
    .from("youtube_videos")
    .select("id")
    .eq("video_id", videoId)
    .eq("is_active", true)
    .single();

  if (existingVideo) {
    return { isTeamMirai: true, youtubeVideoId: existingVideo.id };
  }

  // 2. テーブルになければ、videoDetailから#チームみらいタグを判定
  if (videoDetail) {
    const teamMiraiVideos = filterTeamMiraiVideos([videoDetail]);

    if (teamMiraiVideos.length > 0) {
      // 3. タグがあれば、youtube_videosにupsert
      const savedId = await saveYouTubeVideo(videoDetail);
      return { isTeamMirai: true, youtubeVideoId: savedId || undefined };
    }
  }

  return { isTeamMirai: false };
}

/**
 * いいね済み動画かどうかを確認
 */
async function hasAlreadyAchieved(
  userId: string,
  videoId: string,
): Promise<boolean> {
  const supabase = await createAdminClient();

  const { data } = await supabase
    .from("youtube_video_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("video_id", videoId)
    .single();

  return !!data;
}

/**
 * YouTubeいいねミッション達成を記録
 */
async function recordYouTubeLikeAchievement(
  userId: string,
  missionId: string,
  videoId: string,
  youtubeVideoId?: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createAdminClient();

  // 現在のシーズンIDを取得
  const seasonId = await getCurrentSeasonId();

  // 1. achievementを作成
  const { data: achievement, error: achievementError } = await supabase
    .from("achievements")
    .insert({
      mission_id: missionId,
      user_id: userId,
      season_id: seasonId,
    })
    .select("id")
    .single();

  if (achievementError) {
    console.error("Failed to create achievement:", achievementError);
    return { success: false, error: "ミッション達成の記録に失敗しました" };
  }

  // 2. mission_artifactsを作成
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const { error: artifactError } = await supabase
    .from("mission_artifacts")
    .insert({
      user_id: userId,
      achievement_id: achievement.id,
      artifact_type: "YOUTUBE_LIKE",
      link_url: videoUrl,
    });

  if (artifactError) {
    console.error("Failed to create mission artifact:", artifactError);
    // achievementは作成済みなのでロールバックはしない
  }

  // 3. youtube_video_likesに記録（重複防止用）
  const { error: likeError } = await supabase
    .from("youtube_video_likes")
    .insert({
      user_id: userId,
      video_id: videoId,
      youtube_video_id: youtubeVideoId || null,
      is_team_mirai_video: true,
    });

  if (likeError) {
    console.error("Failed to record youtube video like:", likeError);
    // achievementは作成済みなのでロールバックはしない
  }

  return { success: true };
}

/**
 * 自動同期: ユーザーのいいね動画を取得し、チームみらい動画を達成記録
 */
export async function syncUserYouTubeLikes(
  userId: string,
  accessToken: string,
  missionId: string,
): Promise<YouTubeLikeSyncResult> {
  try {
    // 1. YouTube APIでいいね動画を取得
    const likedVideos = await fetchUserLikedVideos(accessToken);

    let newAchievements = 0;
    let alreadyAchieved = 0;
    let notTeamMirai = 0;

    // 2. 各動画について処理
    for (const video of likedVideos) {
      // 既に達成済みかチェック
      const alreadyDone = await hasAlreadyAchieved(userId, video.id);
      if (alreadyDone) {
        alreadyAchieved++;
        continue;
      }

      // チームみらい動画か判定
      const { isTeamMirai, youtubeVideoId } = await isTeamMiraiVideo(
        video.id,
        video,
      );

      if (!isTeamMirai) {
        notTeamMirai++;
        continue;
      }

      // 達成を記録
      const result = await recordYouTubeLikeAchievement(
        userId,
        missionId,
        video.id,
        youtubeVideoId,
      );

      if (result.success) {
        newAchievements++;
      }
    }

    return {
      success: true,
      newAchievements,
      alreadyAchieved,
      notTeamMirai,
    };
  } catch (error) {
    console.error("YouTube like sync error:", error);
    return {
      success: false,
      newAchievements: 0,
      alreadyAchieved: 0,
      notTeamMirai: 0,
      error:
        error instanceof Error
          ? error.message
          : "YouTubeいいねの同期に失敗しました",
    };
  }
}

/**
 * URLからYouTube動画IDを抽出
 */
export function extractVideoIdFromUrl(url: string): string | null {
  // https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&]+)/,
  );
  if (watchMatch) {
    return watchMatch[1];
  }

  // https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) {
    return shortMatch[1];
  }

  // https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

/**
 * 手動登録: URL入力からミッション達成を記録
 */
export async function recordManualYouTubeLike(
  userId: string,
  videoUrl: string,
  missionId: string,
): Promise<ManualLikeResult> {
  try {
    // 1. URLから動画IDを抽出
    const videoId = extractVideoIdFromUrl(videoUrl);
    if (!videoId) {
      return {
        success: false,
        isNewAchievement: false,
        error: "有効なYouTube URLを入力してください",
      };
    }

    // 2. 既に達成済みかチェック
    const alreadyDone = await hasAlreadyAchieved(userId, videoId);
    if (alreadyDone) {
      return {
        success: true,
        isNewAchievement: false,
        error: "この動画は既に達成済みです",
      };
    }

    // 3. チームみらい動画か判定（手動の場合はvideoDetailなしで判定）
    const { isTeamMirai, youtubeVideoId } = await isTeamMiraiVideo(videoId);

    if (!isTeamMirai) {
      return {
        success: false,
        isNewAchievement: false,
        error:
          "この動画はチームみらい関連の動画ではないため、ミッション達成の対象外です",
      };
    }

    // 4. 達成を記録
    const result = await recordYouTubeLikeAchievement(
      userId,
      missionId,
      videoId,
      youtubeVideoId,
    );

    if (!result.success) {
      return {
        success: false,
        isNewAchievement: false,
        error: result.error,
      };
    }

    return {
      success: true,
      isNewAchievement: true,
    };
  } catch (error) {
    console.error("Manual YouTube like error:", error);
    return {
      success: false,
      isNewAchievement: false,
      error: error instanceof Error ? error.message : "手動登録に失敗しました",
    };
  }
}
