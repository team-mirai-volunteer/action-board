"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import {
  exchangeCodeForToken,
  fetchChannelInfo,
  refreshAccessToken,
} from "../services/youtube-client";
import type { YouTubeLinkResult } from "../types";
import type { YouTubeAuthClient } from "../types/youtube-auth-client";
import { linkYouTubeAccount } from "../use-cases/link-youtube-account";
import { refreshYouTubeToken } from "../use-cases/refresh-youtube-token";
import { unlinkYouTubeAccount } from "../use-cases/unlink-youtube-account";

/**
 * 本番用YouTubeAuthClient
 * 既存のyoutube-clientサービス関数をラップする
 */
const realYouTubeAuthClient: YouTubeAuthClient = {
  exchangeCodeForToken,
  refreshAccessToken,
  fetchChannelInfo,
};

/**
 * YouTubeアカウント連携処理のServer Action
 * 認証コードをトークンに交換し、youtube_user_connectionsテーブルに保存
 */
export async function handleYouTubeLinkAction(
  code: string,
): Promise<YouTubeLinkResult> {
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

    const headerOrigin = (await headers()).get("origin");
    const origin = headerOrigin || process.env.NEXT_PUBLIC_APP_ORIGIN;
    const redirectUri = `${origin}/auth/youtube-callback`;

    const adminClient = await createAdminClient();
    return await linkYouTubeAccount(adminClient, realYouTubeAuthClient, {
      userId: user.id,
      code,
      redirectUri,
    });
  } catch (error) {
    console.error("YouTube link error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "YouTube連携中にエラーが発生しました",
    };
  }
}

/**
 * YouTubeアカウント連携解除のServer Action
 */
export async function unlinkYouTubeAccountAction(): Promise<YouTubeLinkResult> {
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

    const adminClient = await createAdminClient();
    return await unlinkYouTubeAccount(adminClient, user.id);
  } catch (error) {
    console.error("YouTube unlink error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "YouTube連携解除中にエラーが発生しました",
    };
  }
}

/**
 * YouTubeトークンをリフレッシュする
 */
export async function refreshYouTubeTokenAction(): Promise<{
  success: boolean;
  accessToken?: string;
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

    const adminClient = await createAdminClient();
    return await refreshYouTubeToken(
      adminClient,
      realYouTubeAuthClient,
      user.id,
    );
  } catch (error) {
    console.error("YouTube token refresh error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "トークン更新中にエラーが発生しました",
    };
  }
}

/**
 * 現在のユーザーのYouTube連携情報を取得するServer Action
 * セッションから認証済みユーザーIDを取得して、そのユーザーの連携情報のみを返す
 */
export async function getMyYouTubeConnectionAction(): Promise<{
  success: boolean;
  connection?: {
    channelId: string;
    accessToken: string;
    displayName?: string;
    tokenExpiresAt: string;
  };
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

    const adminClient = await createAdminClient();
    const { data: connection, error } = await adminClient
      .from("youtube_user_connections")
      .select("channel_id, access_token, display_name, token_expires_at")
      .eq("user_id", user.id)
      .single();

    if (error || !connection) {
      return {
        success: false,
        error: "YouTube連携情報が見つかりません",
      };
    }

    return {
      success: true,
      connection: {
        channelId: connection.channel_id,
        accessToken: connection.access_token,
        displayName: connection.display_name ?? undefined,
        tokenExpiresAt: connection.token_expires_at,
      },
    };
  } catch (error) {
    console.error("Get YouTube connection error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "YouTube連携情報の取得に失敗しました",
    };
  }
}
