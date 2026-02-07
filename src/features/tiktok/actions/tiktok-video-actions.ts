"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import { isTokenExpired } from "@/lib/utils/oauth-utils";
import {
  getUserTikTokVideos,
  syncUserTikTokVideos,
} from "../services/tiktok-video-service";
import type { TikTokSyncResult, TikTokVideo, TikTokVideoStats } from "../types";
import {
  getTikTokConnectionForUser,
  refreshTikTokTokenAction,
} from "./tiktok-auth-actions";

/**
 * 現在のユーザーのTikTok動画を同期するServer Action
 */
export async function syncMyTikTokVideosAction(): Promise<TikTokSyncResult> {
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

    // TikTok連携情報をテーブルから取得
    let connection = await getTikTokConnectionForUser(user.id);

    if (!connection) {
      return {
        success: false,
        error: "TikTokアカウントが連携されていません",
      };
    }

    // トークンの有効期限をチェック
    if (isTokenExpired(connection.tokenExpiresAt)) {
      // トークンが期限切れの場合、リフレッシュを試みる
      logger.debug("TikTok access token expired, attempting refresh...");
      const refreshResult = await refreshTikTokTokenAction();

      if (!refreshResult.success) {
        return {
          success: false,
          error:
            "TikTokのアクセストークンが期限切れです。再度連携してください。",
        };
      }

      // リフレッシュ成功後、最新の接続情報を再取得
      connection = await getTikTokConnectionForUser(user.id);

      if (!connection) {
        return {
          success: false,
          error: "トークンの更新に失敗しました。再度連携してください。",
        };
      }
    }

    // 動画を同期
    const result = await syncUserTikTokVideos(
      user.id,
      connection.accessToken,
      connection.tiktokOpenId,
      connection.displayName,
    );

    return result;
  } catch (error) {
    console.error("Sync TikTok videos action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "TikTok動画の同期に失敗しました",
    };
  }
}

/**
 * 現在のユーザーのTikTok動画一覧を取得するServer Action
 */
export async function getMyTikTokVideosAction(
  limit = 20,
  offset = 0,
): Promise<{
  success: boolean;
  videos?: (TikTokVideo & { latest_stats?: TikTokVideoStats })[];
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

    const videos = await getUserTikTokVideos(user.id, limit, offset);

    return {
      success: true,
      videos,
    };
  } catch (error) {
    console.error("Get TikTok videos action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "TikTok動画の取得に失敗しました",
    };
  }
}

/**
 * TikTok連携状態を取得するServer Action
 */
export async function getTikTokLinkStatusAction(): Promise<{
  isLinked: boolean;
  tiktokDisplayName?: string;
  tiktokAvatarUrl?: string;
  linkedAt?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        isLinked: false,
      };
    }

    // tiktok_user_connectionsテーブルから連携状態を取得
    const adminClient = await createAdminClient();
    const { data: connection, error } = await adminClient
      .from("tiktok_user_connections")
      .select("display_name, avatar_url, created_at")
      .eq("user_id", user.id)
      .single();

    if (error || !connection) {
      return {
        isLinked: false,
      };
    }

    return {
      isLinked: true,
      tiktokDisplayName: connection.display_name ?? undefined,
      tiktokAvatarUrl: connection.avatar_url ?? undefined,
      linkedAt: connection.created_at ?? undefined,
    };
  } catch (error) {
    console.error("Get TikTok link status error:", error);
    return {
      isLinked: false,
    };
  }
}
