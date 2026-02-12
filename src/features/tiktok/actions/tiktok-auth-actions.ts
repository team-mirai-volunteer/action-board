"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { tiktokClient } from "../services/tiktok-client";
import type { TikTokLinkResult } from "../types";
import { linkTikTokAccount } from "../use-cases/link-tiktok-account";
import { refreshTikTokToken } from "../use-cases/refresh-tiktok-token";
import { unlinkTikTokAccount } from "../use-cases/unlink-tiktok-account";

/**
 * TikTokアカウント連携処理のServer Action
 * 認証コードをトークンに交換し、tiktok_user_connectionsテーブルに保存
 */
export async function handleTikTokLinkAction(
  code: string,
  codeVerifier: string,
): Promise<TikTokLinkResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "ログインが必要です" };
    }

    const headerOrigin = (await headers()).get("origin");
    const origin = headerOrigin || process.env.NEXT_PUBLIC_APP_ORIGIN;
    const redirectUri = `${origin}/auth/tiktok-callback`;

    const adminClient = await createAdminClient();
    return await linkTikTokAccount(adminClient, tiktokClient, {
      userId: user.id,
      code,
      codeVerifier,
      redirectUri,
    });
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
      return { success: false, error: "ログインが必要です" };
    }

    const adminClient = await createAdminClient();
    return await unlinkTikTokAccount(adminClient, user.id);
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
      return { success: false, error: "ログインが必要です" };
    }

    const adminClient = await createAdminClient();
    return await refreshTikTokToken(adminClient, tiktokClient, user.id);
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
