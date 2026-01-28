import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { hasTeamMiraiTag } from "../constants/team-mirai";
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
 * いいね同期結果
 */
export interface SyncLikesResult {
  success: boolean;
  newLikesCount?: number;
  error?: string;
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
  // youtube-clientから生データを取得
  const rawItems = await fetchUserLikedVideosRaw(accessToken, maxResults);

  // LikedVideo形式に変換
  return rawItems.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
  }));
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

  const supabase = await createClient();

  // 1. DBに存在する動画を一括チェック
  const { data: dbVideos } = await supabase
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
        if (hasTeamMiraiTag(detail.snippet.tags)) {
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
 * YouTube URLから動画IDを抽出する
 * @param url YouTube動画URL
 */
export function extractVideoIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/embed\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
    /(?:youtube\.com\/live\/)([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * ユーザーが既にいいね記録済みの動画IDセットを取得する
 * @param userId ユーザーID
 */
export async function getUserRecordedLikes(
  userId: string,
): Promise<Set<string>> {
  const supabase = await createClient();

  const { data: likes } = await supabase
    .from("youtube_video_likes")
    .select("video_id")
    .eq("user_id", userId);

  return new Set((likes || []).map((l) => l.video_id));
}

/**
 * YouTube連携のcreated_atを取得する
 * @param userId ユーザーID
 */
export async function getYouTubeConnectionCreatedAt(
  userId: string,
): Promise<string | null> {
  const adminClient = await createAdminClient();

  const { data: connection } = await adminClient
    .from("youtube_user_connections")
    .select("created_at")
    .eq("user_id", userId)
    .single();

  return connection?.created_at ?? null;
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
  const supabase = await createClient();

  const { error } = await supabase.from("youtube_video_likes").insert({
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
