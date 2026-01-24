"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import type {
  TikTokLinkResult,
  TikTokTokenResponse,
  TikTokUser,
  TikTokUserInfoResponse,
} from "../types";

/**
 * TikTokアカウント連携処理のServer Action
 * 認証コードをトークンに交換し、ユーザーのmetadataにTikTok情報を保存
 */
export async function handleTikTokLinkAction(
  code: string,
  codeVerifier: string,
): Promise<TikTokLinkResult> {
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
        error: "ログインが必要です",
      };
    }

    // TikTok APIでトークンと交換
    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      console.error("TikTok credentials not configured");
      return {
        success: false,
        error: "TikTok認証の設定が不完全です",
      };
    }

    const origin = (await headers()).get("origin");
    const redirectUri = `${origin || "http://localhost:3000"}/auth/tiktok-callback`;

    // トークン交換リクエスト
    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("TikTok token exchange failed:", errorBody);
      return {
        success: false,
        error: "TikTokとの認証に失敗しました",
      };
    }

    const tokens: TikTokTokenResponse = await tokenResponse.json();

    if (!tokens.access_token || !tokens.open_id) {
      console.error("Invalid TikTok token response:", tokens);
      return {
        success: false,
        error: "TikTokからの応答が不正です",
      };
    }

    // TikTokユーザー情報を取得
    const userInfoResponse = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      const errorBody = await userInfoResponse.text();
      console.error("TikTok user info failed:", errorBody);
      return {
        success: false,
        error: "TikTokユーザー情報の取得に失敗しました",
      };
    }

    const userInfoData: TikTokUserInfoResponse = await userInfoResponse.json();

    if (userInfoData.error?.code && userInfoData.error.code !== "ok") {
      console.error("TikTok user info error:", userInfoData.error);
      return {
        success: false,
        error: `TikTokエラー: ${userInfoData.error.message}`,
      };
    }

    const tiktokUser: TikTokUser = userInfoData.data.user;

    // ユーザーのmetadataにTikTok情報を保存
    const adminClient = await createAdminClient();
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          tiktok_open_id: tiktokUser.open_id,
          tiktok_display_name: tiktokUser.display_name,
          tiktok_avatar_url: tiktokUser.avatar_url,
          tiktok_linked_at: new Date().toISOString(),
          tiktok_access_token: tokens.access_token,
          tiktok_refresh_token: tokens.refresh_token,
          tiktok_token_expires_at: new Date(
            Date.now() + tokens.expires_in * 1000,
          ).toISOString(),
        },
      },
    );

    if (updateError) {
      console.error("Failed to update user metadata:", updateError);
      return {
        success: false,
        error: "ユーザー情報の更新に失敗しました",
      };
    }

    return {
      success: true,
      user: tiktokUser,
    };
  } catch (error) {
    console.error("TikTok link error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "TikTok連携中にエラーが発生しました",
    };
  }
}

/**
 * TikTokアカウント連携解除のServer Action
 */
export async function unlinkTikTokAccountAction(): Promise<TikTokLinkResult> {
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

    // TikTok関連のmetadataを削除
    const adminClient = await createAdminClient();
    const newMetadata = { ...user.user_metadata };
    newMetadata.tiktok_open_id = undefined;
    newMetadata.tiktok_display_name = undefined;
    newMetadata.tiktok_avatar_url = undefined;
    newMetadata.tiktok_linked_at = undefined;
    newMetadata.tiktok_access_token = undefined;
    newMetadata.tiktok_refresh_token = undefined;
    newMetadata.tiktok_token_expires_at = undefined;

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: newMetadata,
      },
    );

    if (updateError) {
      console.error("Failed to unlink TikTok:", updateError);
      return {
        success: false,
        error: "TikTok連携解除に失敗しました",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("TikTok unlink error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "TikTok連携解除中にエラーが発生しました",
    };
  }
}

/**
 * TikTokトークンをリフレッシュする
 */
export async function refreshTikTokTokenAction(): Promise<TikTokLinkResult> {
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

    const refreshToken = user.user_metadata?.tiktok_refresh_token;
    if (!refreshToken) {
      return {
        success: false,
        error: "TikTokが連携されていません",
      };
    }

    const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

    if (!clientKey || !clientSecret) {
      return {
        success: false,
        error: "TikTok認証の設定が不完全です",
      };
    }

    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("TikTok token refresh failed:", errorBody);
      return {
        success: false,
        error: "TikTokトークンの更新に失敗しました",
      };
    }

    const tokens: TikTokTokenResponse = await tokenResponse.json();

    // 新しいトークンを保存
    const adminClient = await createAdminClient();
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          tiktok_access_token: tokens.access_token,
          tiktok_refresh_token: tokens.refresh_token,
          tiktok_token_expires_at: new Date(
            Date.now() + tokens.expires_in * 1000,
          ).toISOString(),
        },
      },
    );

    if (updateError) {
      console.error("Failed to update refreshed token:", updateError);
      return {
        success: false,
        error: "トークンの保存に失敗しました",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("TikTok token refresh error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "トークン更新中にエラーが発生しました",
    };
  }
}
