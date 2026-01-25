"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import {
  exchangeCodeForToken,
  fetchUserInfo,
  refreshAccessToken,
} from "../services/tiktok-client";
import type { TikTokLinkResult } from "../types";

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

    const headerOrigin = (await headers()).get("origin");
    const origin = headerOrigin || process.env.NEXT_PUBLIC_APP_ORIGIN;
    const redirectUri = `${origin}/auth/tiktok-callback`;

    // TikTok APIでトークンと交換
    const tokens = await exchangeCodeForToken(code, codeVerifier, redirectUri);

    // TikTokユーザー情報を取得
    const tiktokUser = await fetchUserInfo(tokens.access_token);

    const adminClient = await createAdminClient();

    // 同じTikTokアカウントが他のユーザーに連携されていないかチェック
    const { data: existingConnection } = await adminClient
      .from("tiktok_user_connections")
      .select("user_id")
      .eq("tiktok_open_id", tiktokUser.open_id)
      .maybeSingle();

    if (existingConnection && existingConnection.user_id !== user.id) {
      return {
        success: false,
        error:
          "このTikTokアカウントは既に別のユーザーに連携されています。別のTikTokアカウントをお試しください。",
      };
    }

    // tiktok_user_connectionsテーブルに保存
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
    const { error: deleteError } = await adminClient
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
    const { data: connection, error: fetchError } = await adminClient
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

    // TikTok APIでトークンをリフレッシュ
    const tokens = await refreshAccessToken(connection.refresh_token);

    // 新しいトークンを保存
    const { error: updateError } = await adminClient
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
    const { data: connection, error } = await adminClient
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
      displayName: connection.display_name ?? undefined,
      tokenExpiresAt: connection.token_expires_at,
    };
  } catch {
    return null;
  }
}
