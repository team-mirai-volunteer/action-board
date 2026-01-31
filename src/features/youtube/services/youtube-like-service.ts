import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { hasTeamMiraiTag } from "../constants/team-mirai";
import { fetchVideoDetailsByApiKey } from "./youtube-client";

// コアロジックを再エクスポート
export {
  type LikedVideo,
  type SyncLikesForUserResult,
  checkTeamMiraiVideosBatch,
  createYouTubeLikeRecord,
  fetchUserLikedVideos,
  getUserRecordedLikes,
  syncLikesForUser,
} from "./sync-likes-core";

/**
 * いいね同期結果
 */
export interface SyncLikesResult {
  success: boolean;
  newLikesCount?: number;
  error?: string;
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
 * YouTube接続情報
 */
export interface YouTubeConnection {
  accessToken: string;
  tokenExpiresAt: string;
  refreshToken: string;
}

/**
 * YouTube接続の取得結果
 */
export interface GetYouTubeConnectionResult {
  success: boolean;
  connection?: YouTubeConnection;
  error?: string;
}

/**
 * ユーザーのYouTube接続情報を取得する
 * @param userId ユーザーID
 */
export async function getYouTubeConnection(
  userId: string,
): Promise<GetYouTubeConnectionResult> {
  const adminClient = await createAdminClient();
  const { data: connection, error: connectionError } = await adminClient
    .from("youtube_user_connections")
    .select("access_token, token_expires_at, refresh_token")
    .eq("user_id", userId)
    .single();

  if (connectionError || !connection) {
    return {
      success: false,
      error: "YouTubeアカウントが連携されていません",
    };
  }

  return {
    success: true,
    connection: {
      accessToken: connection.access_token,
      tokenExpiresAt: connection.token_expires_at,
      refreshToken: connection.refresh_token,
    },
  };
}

/**
 * トークンが期限切れかどうかをチェックする
 * 共通ロジックは packages/youtube_data から再エクスポート
 */
export { isTokenExpired } from "@action-board/youtube-data/google-auth";

/**
 * チームみらい動画の検証結果
 */
export interface ValidateTeamMiraiVideoResult {
  success: boolean;
  videoId?: string;
  isTeamMirai?: boolean;
  error?: string;
}

/**
 * YouTube URLからチームみらい動画かどうかを検証し、必要であればDBに追加する
 * @param videoUrl YouTube動画URL
 */
export async function validateAndRegisterTeamMiraiVideo(
  videoUrl: string,
): Promise<ValidateTeamMiraiVideoResult> {
  const videoId = extractVideoIdFromUrl(videoUrl);
  if (!videoId) {
    return {
      success: false,
      error: "有効なYouTube URLを入力してください",
    };
  }

  const supabase = await createClient();

  // DBに既に存在するか確認
  const { data: existingVideo } = await supabase
    .from("youtube_videos")
    .select("video_id")
    .eq("video_id", videoId)
    .maybeSingle();

  if (existingVideo) {
    // 既にDBに存在する = チームみらい動画
    return {
      success: true,
      videoId,
      isTeamMirai: true,
    };
  }

  // YouTube APIで動画詳細を取得
  const videoDetails = await fetchVideoDetailsByApiKey([videoId]);
  const videoDetail = videoDetails[0];

  if (!videoDetail) {
    return {
      success: false,
      error:
        "YouTube動画の情報を取得できませんでした。URLが正しいか確認してください。",
    };
  }

  // チームみらいの動画かチェック
  if (
    !hasTeamMiraiTag(
      videoDetail.snippet.tags,
      videoDetail.snippet.title,
      videoDetail.snippet.description,
    )
  ) {
    return {
      success: true,
      videoId,
      isTeamMirai: false,
      error:
        "この動画はチームみらいの動画ではありません。チームみらいの動画にいいねしてURLを入力してください。",
    };
  }

  // チームみらい動画の場合、youtube_videosに追加
  const adminClient = await createAdminClient();
  const { error: videoInsertError } = await adminClient
    .from("youtube_videos")
    .insert({
      video_id: videoId,
      video_url: videoUrl,
      title: videoDetail.snippet.title,
      description: videoDetail.snippet.description || null,
      thumbnail_url:
        videoDetail.snippet.thumbnails.medium?.url ||
        videoDetail.snippet.thumbnails.default?.url ||
        null,
      channel_id: videoDetail.snippet.channelId,
      channel_title: videoDetail.snippet.channelTitle,
      published_at: videoDetail.snippet.publishedAt,
      tags: videoDetail.snippet.tags || [],
      is_active: true,
    });

  if (videoInsertError) {
    console.error("YouTube video insert error:", videoInsertError);
    // 動画の追加に失敗してもエラーにはしない（すでに存在している可能性があるため）
  }

  return {
    success: true,
    videoId,
    isTeamMirai: true,
  };
}
