"use server";

import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { createClient } from "@/lib/supabase/client";
import {
  type LikedVideo,
  checkTeamMiraiVideosBatch,
  extractVideoIdFromUrl,
  fetchUserLikedVideos,
  getYouTubeConnection,
  isTokenExpired,
} from "../services/youtube-like-service";
import { refreshYouTubeTokenAction } from "./youtube-auth-actions";

/**
 * チームみらい動画へのいいね検出結果
 */
export interface DetectedLike {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  videoUrl: string;
  alreadyRecorded: boolean;
}

/**
 * いいね検出結果
 */
export interface DetectLikesResult {
  success: boolean;
  detectedLikes?: DetectedLike[];
  error?: string;
}

/**
 * 有効なYouTubeアクセストークンを取得する共通ヘルパー
 * トークンが期限切れの場合はリフレッシュを試みる
 */
async function getValidAccessToken(
  userId: string,
): Promise<
  { success: true; accessToken: string } | { success: false; error: string }
> {
  const connectionResult = await getYouTubeConnection(userId);
  if (!connectionResult.success || !connectionResult.connection) {
    return {
      success: false,
      error: connectionResult.error || "YouTubeアカウントが連携されていません",
    };
  }

  let accessToken = connectionResult.connection.accessToken;

  // トークンの有効期限をチェック
  if (isTokenExpired(connectionResult.connection.tokenExpiresAt)) {
    console.log("YouTube access token expired, attempting refresh...");
    const refreshResult = await refreshYouTubeTokenAction();

    if (!refreshResult.success || !refreshResult.accessToken) {
      return {
        success: false,
        error:
          "YouTubeのアクセストークンが期限切れです。再度連携してください。",
      };
    }

    accessToken = refreshResult.accessToken;
  }

  return { success: true, accessToken };
}

/**
 * YouTubeいいねを検出するServer Action
 * 連携済みユーザーのいいね動画を取得し、チームみらい動画を検出する
 */
export async function detectYouTubeLikesAction(): Promise<DetectLikesResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // 有効なアクセストークンを取得
    const tokenResult = await getValidAccessToken(user.id);
    if (!tokenResult.success) {
      return {
        success: false,
        error: tokenResult.error,
      };
    }
    const accessToken = tokenResult.accessToken;

    // ユーザーがいいねした動画を取得
    let likedVideos: LikedVideo[];
    try {
      likedVideos = await fetchUserLikedVideos(accessToken, 100);
    } catch (error) {
      console.error("Failed to fetch liked videos:", error);
      return {
        success: false,
        error: "いいねした動画の取得に失敗しました",
      };
    }

    // 既に記録済みのいいねを取得
    const { data: existingLikes } = await supabase
      .from("youtube_video_likes")
      .select("video_id")
      .eq("user_id", user.id);

    const recordedVideoIds = new Set(
      (existingLikes || []).map((l) => l.video_id),
    );

    // チームみらい動画を一括チェック（API節約のため）
    const videoIds = likedVideos.map((v) => v.videoId);
    const teamMiraiResults = await checkTeamMiraiVideosBatch(
      videoIds,
      accessToken,
    );

    // 検出結果を整形
    const detectedLikes: DetectedLike[] = [];
    for (const video of likedVideos) {
      const result = teamMiraiResults.get(video.videoId);
      if (result?.isTeamMirai) {
        detectedLikes.push({
          videoId: video.videoId,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl:
            result.videoUrl ||
            `https://www.youtube.com/watch?v=${video.videoId}`,
          alreadyRecorded: recordedVideoIds.has(video.videoId),
        });
      }
    }

    return {
      success: true,
      detectedLikes,
    };
  } catch (error) {
    console.error("Detect YouTube likes error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "いいねの検出に失敗しました",
    };
  }
}

/**
 * 検出されたいいねをミッション達成として記録するServer Action
 */
export async function recordYouTubeLikeAction(
  missionId: string,
  videoId: string,
  videoUrl: string,
): Promise<{ success: boolean; xpGranted?: number; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // 既に記録済みか確認
    const { data: existingLike } = await supabase
      .from("youtube_video_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle();

    if (existingLike) {
      return {
        success: false,
        error: "この動画へのいいねは既に記録されています",
      };
    }

    // achieveMissionActionを使ってミッション達成を記録
    const formData = new FormData();
    formData.append("missionId", missionId);
    formData.append("requiredArtifactType", "YOUTUBE");
    formData.append("artifactLink", videoUrl);

    const result = await achieveMissionAction(formData);

    return {
      success: result.success,
      xpGranted: result.xpGranted,
      error: result.success ? undefined : result.error,
    };
  } catch (error) {
    console.error("Record YouTube like error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "いいねの記録に失敗しました",
    };
  }
}

/**
 * YouTube URLが有効かどうかを確認するServer Action
 * フォーマットチェックのみ（チームみらい動画かどうかはチェックしない）
 */
export async function validateYouTubeUrlAction(url: string): Promise<{
  valid: boolean;
  videoId?: string;
  error?: string;
}> {
  const videoId = extractVideoIdFromUrl(url);

  if (!videoId) {
    return {
      valid: false,
      error: "有効なYouTube URLを入力してください",
    };
  }

  return {
    valid: true,
    videoId,
  };
}

/**
 * いいね記録の詳細情報
 */
export interface RecordedLike {
  videoId: string;
  title: string;
  channelTitle?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  publishedAt?: string;
  recordedAt: string;
}

/**
 * ユーザーが記録したいいね一覧を取得するServer Action
 */
export async function getRecordedLikesAction(): Promise<{
  success: boolean;
  likes?: RecordedLike[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // いいね記録を取得（youtube_videosとJOINして動画情報も取得）
    const { data: likes, error: likesError } = await supabase
      .from("youtube_video_likes")
      .select(
        `
        video_id,
        detected_at,
        created_at,
        youtube_videos (
          title,
          channel_title,
          video_url,
          thumbnail_url,
          published_at
        )
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (likesError) {
      console.error("Failed to fetch recorded likes:", likesError);
      return {
        success: false,
        error: "いいね一覧の取得に失敗しました",
      };
    }

    const recordedLikes: RecordedLike[] = (likes || [])
      .filter((like) => like.youtube_videos)
      .map((like) => ({
        videoId: like.video_id,
        title: like.youtube_videos?.title || "Unknown",
        channelTitle: like.youtube_videos?.channel_title || undefined,
        thumbnailUrl: like.youtube_videos?.thumbnail_url || undefined,
        videoUrl:
          like.youtube_videos?.video_url ||
          `https://www.youtube.com/watch?v=${like.video_id}`,
        publishedAt: like.youtube_videos?.published_at || undefined,
        recordedAt:
          like.detected_at || like.created_at || new Date().toISOString(),
      }));

    return {
      success: true,
      likes: recordedLikes,
    };
  } catch (error) {
    console.error("Get recorded likes error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "いいね一覧の取得に失敗しました",
    };
  }
}

/**
 * 自動達成結果
 */
export interface AutoAchieveResult {
  success: boolean;
  achievedCount: number;
  totalXpGranted: number;
  error?: string;
}

/**
 * YouTubeいいねを自動検出して、ミッション達成を自動で記録するServer Action
 * 連携済みユーザーのいいね動画を取得し、チームみらい動画へのいいねを自動で達成として記録
 */
export async function autoAchieveYouTubeMissionAction(
  missionId: string,
): Promise<AutoAchieveResult> {
  try {
    // まずいいねを検出
    const detectResult = await detectYouTubeLikesAction();
    if (!detectResult.success || !detectResult.detectedLikes) {
      return {
        success: false,
        achievedCount: 0,
        totalXpGranted: 0,
        error: detectResult.error || "いいねの検出に失敗しました",
      };
    }

    // 未記録のいいねをフィルタ
    const unrecordedLikes = detectResult.detectedLikes.filter(
      (like) => !like.alreadyRecorded,
    );

    if (unrecordedLikes.length === 0) {
      return {
        success: true,
        achievedCount: 0,
        totalXpGranted: 0,
      };
    }

    // 未記録のいいねを全て記録
    let achievedCount = 0;
    let totalXpGranted = 0;

    for (const like of unrecordedLikes) {
      const result = await recordYouTubeLikeAction(
        missionId,
        like.videoId,
        like.videoUrl,
      );
      if (result.success) {
        achievedCount++;
        totalXpGranted += result.xpGranted || 0;
      }
    }

    return {
      success: true,
      achievedCount,
      totalXpGranted,
    };
  } catch (error) {
    console.error("Auto achieve YouTube mission error:", error);
    return {
      success: false,
      achievedCount: 0,
      totalXpGranted: 0,
      error: error instanceof Error ? error.message : "自動達成に失敗しました",
    };
  }
}

/**
 * いいね同期結果
 */
export interface SyncLikesResult {
  success: boolean;
  syncedVideoCount: number;
  achievedCount: number;
  totalXpGranted: number;
  error?: string;
}

/**
 * YouTubeいいねを同期し、youtube_videosに追加し、自動でミッションクリアするServer Action
 * YouTube設定ページの同期ボタンから呼び出される
 */
export async function syncYouTubeLikesAction(): Promise<SyncLikesResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        syncedVideoCount: 0,
        achievedCount: 0,
        totalXpGranted: 0,
        error: "ログインが必要です",
      };
    }

    // 有効なアクセストークンを取得
    const tokenResult = await getValidAccessToken(user.id);
    if (!tokenResult.success) {
      return {
        success: false,
        syncedVideoCount: 0,
        achievedCount: 0,
        totalXpGranted: 0,
        error: tokenResult.error,
      };
    }

    // サービス関数を呼び出し
    const { syncLikesForUser } = await import(
      "../services/youtube-like-service"
    );
    return await syncLikesForUser(user.id, tokenResult.accessToken);
  } catch (error) {
    console.error("Sync YouTube likes error:", error);
    return {
      success: false,
      syncedVideoCount: 0,
      achievedCount: 0,
      totalXpGranted: 0,
      error: error instanceof Error ? error.message : "同期に失敗しました",
    };
  }
}
