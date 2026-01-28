"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { refreshAccessToken } from "../services/youtube-client";
import {
  type ManualLikeResult,
  type YouTubeLikeSyncResult,
  recordManualYouTubeLike,
  syncUserYouTubeLikes,
} from "../services/youtube-like-service";

/**
 * YouTubeいいね自動チェックのServer Action
 * ユーザーのいいね動画を取得し、チームみらい動画を自動で達成記録する
 */
export async function checkYouTubeLikesAction(
  missionId: string,
): Promise<YouTubeLikeSyncResult> {
  try {
    // 現在のユーザーを取得
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        newAchievements: 0,
        alreadyAchieved: 0,
        notTeamMirai: 0,
        error: "ログインが必要です",
      };
    }

    // YouTube連携情報を取得
    const adminClient = await createAdminClient();
    const { data: connection, error: connectionError } = await adminClient
      .from("youtube_user_connections")
      .select("access_token, refresh_token, token_expires_at")
      .eq("user_id", user.id)
      .single();

    if (connectionError || !connection) {
      return {
        success: false,
        newAchievements: 0,
        alreadyAchieved: 0,
        notTeamMirai: 0,
        error: "YouTubeアカウントが連携されていません",
      };
    }

    // トークンの有効期限をチェックし、必要ならリフレッシュ
    let accessToken = connection.access_token;
    const tokenExpiresAt = new Date(connection.token_expires_at);
    const now = new Date();

    // 有効期限の5分前を閾値とする
    if (tokenExpiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      try {
        const tokens = await refreshAccessToken(connection.refresh_token);
        accessToken = tokens.access_token;

        // 新しいトークンを保存
        await adminClient
          .from("youtube_user_connections")
          .update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: new Date(
              Date.now() + tokens.expires_in * 1000,
            ).toISOString(),
          })
          .eq("user_id", user.id);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return {
          success: false,
          newAchievements: 0,
          alreadyAchieved: 0,
          notTeamMirai: 0,
          error:
            "YouTube認証が無効です。設定画面からYouTubeを再連携してください。",
        };
      }
    }

    // いいね同期を実行
    const result = await syncUserYouTubeLikes(user.id, accessToken, missionId);

    return result;
  } catch (error) {
    console.error("Check YouTube likes error:", error);
    return {
      success: false,
      newAchievements: 0,
      alreadyAchieved: 0,
      notTeamMirai: 0,
      error:
        error instanceof Error
          ? error.message
          : "YouTubeいいねの確認中にエラーが発生しました",
    };
  }
}

/**
 * YouTube動画URLを手動で提出するServer Action
 */
export async function submitManualYouTubeLikeAction(
  missionId: string,
  videoUrl: string,
): Promise<ManualLikeResult> {
  try {
    // 現在のユーザーを取得
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        isNewAchievement: false,
        error: "ログインが必要です",
      };
    }

    // 手動登録を実行
    const result = await recordManualYouTubeLike(user.id, videoUrl, missionId);

    return result;
  } catch (error) {
    console.error("Submit manual YouTube like error:", error);
    return {
      success: false,
      isNewAchievement: false,
      error:
        error instanceof Error
          ? error.message
          : "手動登録中にエラーが発生しました",
    };
  }
}

/**
 * ユーザーのYouTube連携状態を確認するServer Action
 */
export async function checkYouTubeConnectionStatusAction(): Promise<{
  isConnected: boolean;
  displayName?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { isConnected: false };
    }

    const adminClient = await createAdminClient();
    const { data: connection } = await adminClient
      .from("youtube_user_connections")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    if (!connection) {
      return { isConnected: false };
    }

    return {
      isConnected: true,
      displayName: connection.display_name ?? undefined,
    };
  } catch {
    return { isConnected: false };
  }
}
