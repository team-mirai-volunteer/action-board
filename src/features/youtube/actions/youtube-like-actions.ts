"use server";

import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import {
  type LikedVideo,
  checkTeamMiraiVideosBatch,
  extractVideoIdFromUrl,
  fetchUserLikedVideos,
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

    // YouTube連携情報を取得
    const adminClient = await createAdminClient();
    const { data: connection, error: connectionError } = await adminClient
      .from("youtube_user_connections")
      .select("access_token, token_expires_at, refresh_token")
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection) {
      return {
        success: false,
        error: "YouTubeアカウントが連携されていません",
      };
    }

    let accessToken = connection.access_token;

    // トークンの有効期限をチェック
    if (new Date(connection.token_expires_at) < new Date()) {
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
