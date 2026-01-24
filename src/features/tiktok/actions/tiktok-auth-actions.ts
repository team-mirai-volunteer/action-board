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
 * 認証コードをトークンに交換し、tiktok_user_connectionsテーブルに保存
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

    // tiktok_user_connectionsテーブルに保存（upsert）
    // NOTE: テーブルがSupabase型定義に存在しないため、マイグレーション適用後に npm run types で型を更新する
    const adminClient = await createAdminClient();
    const { error: upsertError } = await adminClient
      .from("tiktok_user_connections")
      .upsert(
        {
          user_id: user.id,
          tiktok_open_id: tiktokUser.open_id,
          tiktok_union_id: tiktokUser.union_id || null,
          display_name: tiktokUser.display_name,
          avatar_url: tiktokUser.avatar_url || null,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(
            Date.now() + tokens.expires_in * 1000,
          ).toISOString(),
          refresh_token_expires_at: tokens.refresh_expires_in
            ? new Date(
                Date.now() + tokens.refresh_expires_in * 1000,
              ).toISOString()
            : null,
          scopes: tokens.scope ? tokens.scope.split(",") : null,
        },
        {
          onConflict: "user_id",
        },
      );

    if (upsertError) {
      console.error("Failed to save TikTok connection:", upsertError);
      return {
        success: false,
        error: "TikTok連携情報の保存に失敗しました",
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

    // tiktok_user_connectionsテーブルから削除
    const adminClient = await createAdminClient();
    // biome-ignore lint/suspicious/noExplicitAny: tiktok_user_connectionsテーブルの型が生成されるまでの一時的な対応
    const { error: deleteError } = await (adminClient as any)
      .from("tiktok_user_connections")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to unlink TikTok:", deleteError);
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

    // tiktok_user_connectionsからリフレッシュトークンを取得
    const adminClient = await createAdminClient();
    // biome-ignore lint/suspicious/noExplicitAny: tiktok_user_connectionsテーブルの型が生成されるまでの一時的な対応
    const { data: connection, error: fetchError } = await (adminClient as any)
      .from("tiktok_user_connections")
      .select("refresh_token")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !connection?.refresh_token) {
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
          refresh_token: connection.refresh_token,
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
    // biome-ignore lint/suspicious/noExplicitAny: tiktok_user_connectionsテーブルの型が生成されるまでの一時的な対応
    const { error: updateError } = await (adminClient as any)
      .from("tiktok_user_connections")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000,
        ).toISOString(),
        refresh_token_expires_at: tokens.refresh_expires_in
          ? new Date(
              Date.now() + tokens.refresh_expires_in * 1000,
            ).toISOString()
          : null,
      })
      .eq("user_id", user.id);

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

/**
 * TikTok連携情報を取得する（内部用）
 */
export async function getTikTokConnectionForUser(userId: string): Promise<{
  tiktokOpenId: string;
  accessToken: string;
  displayName?: string;
  tokenExpiresAt: string;
} | null> {
  try {
    const adminClient = await createAdminClient();
    // biome-ignore lint/suspicious/noExplicitAny: tiktok_user_connectionsテーブルの型が生成されるまでの一時的な対応
    const { data: connection, error } = await (adminClient as any)
      .from("tiktok_user_connections")
      .select("tiktok_open_id, access_token, display_name, token_expires_at")
      .eq("user_id", userId)
      .single();

    if (error || !connection) {
      return null;
    }

    return {
      tiktokOpenId: connection.tiktok_open_id,
      accessToken: connection.access_token,
      displayName: connection.display_name,
      tokenExpiresAt: connection.token_expires_at,
    };
  } catch {
    return null;
  }
}
