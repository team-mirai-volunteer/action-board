"use server";

import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";
import {
  getUserTikTokVideos,
  syncUserTikTokVideos,
} from "../services/tiktok-video-service";
import type { TikTokSyncResult, TikTokVideo, TikTokVideoStats } from "../types";
import { refreshTikTokTokenAction } from "./tiktok-auth-actions";

/**
 * 現在のユーザーのTikTok動画を同期するServer Action
 */
export async function syncMyTikTokVideosAction(): Promise<TikTokSyncResult> {
  try {
    const supabase = await createClient();
    let {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "ログインが必要です",
      };
    }

    // TikTok連携情報を取得
    let tiktokOpenId = user.user_metadata?.tiktok_open_id;
    let accessToken = user.user_metadata?.tiktok_access_token;
    const tiktokUsername = user.user_metadata?.tiktok_display_name;

    if (!tiktokOpenId || !accessToken) {
      return {
        success: false,
        error: "TikTokアカウントが連携されていません",
      };
    }

    // トークンの有効期限をチェック
    const tokenExpiresAt = user.user_metadata?.tiktok_token_expires_at;
    if (tokenExpiresAt && new Date(tokenExpiresAt) < new Date()) {
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

      // リフレッシュ成功後、最新のユーザー情報を再取得
      const { data: refreshedUser } = await supabase.auth.getUser();
      if (refreshedUser.user) {
        user = refreshedUser.user;
        accessToken = user.user_metadata?.tiktok_access_token;
        tiktokOpenId = user.user_metadata?.tiktok_open_id;
      }

      if (!accessToken) {
        return {
          success: false,
          error: "トークンの更新に失敗しました。再度連携してください。",
        };
      }
    }

    // 動画を同期
    const result = await syncUserTikTokVideos(
      user.id,
      accessToken,
      tiktokOpenId,
      tiktokUsername,
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

    const tiktokOpenId = user.user_metadata?.tiktok_open_id;

    if (!tiktokOpenId) {
      return {
        isLinked: false,
      };
    }

    return {
      isLinked: true,
      tiktokDisplayName: user.user_metadata?.tiktok_display_name,
      tiktokAvatarUrl: user.user_metadata?.tiktok_avatar_url,
      linkedAt: user.user_metadata?.tiktok_linked_at,
    };
  } catch (error) {
    console.error("Get TikTok link status error:", error);
    return {
      isLinked: false,
    };
  }
}
