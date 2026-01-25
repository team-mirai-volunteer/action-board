"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { headers } from "next/headers";
import {
  exchangeCodeForToken,
  fetchChannelInfo,
  refreshAccessToken,
} from "../services/youtube-client";
import type { YouTubeLinkResult } from "../types";

/**
 * YouTubeアカウント連携処理のServer Action
 * 認証コードをトークンに交換し、youtube_user_connectionsテーブルに保存
 */
export async function handleYouTubeLinkAction(
  code: string,
): Promise<YouTubeLinkResult> {
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
    const redirectUri = `${origin}/auth/youtube-callback`;

    // Google APIでトークンと交換
    const tokens = await exchangeCodeForToken(code, redirectUri);

    // YouTubeチャンネル情報を取得
    const channel = await fetchChannelInfo(tokens.access_token);

    const adminClient = await createAdminClient();

    // 同じGoogleアカウントが他のユーザーに連携されていないかチェック
    const { data: existingByGoogleId } = await adminClient
      .from("youtube_user_connections")
      .select("user_id")
      .eq("google_user_id", channel.id)
      .maybeSingle();

    if (existingByGoogleId && existingByGoogleId.user_id !== user.id) {
      return {
        success: false,
        error:
          "このGoogleアカウントは既に別のユーザーに連携されています。別のGoogleアカウントをお試しください。",
      };
    }

    // 同じYouTubeチャンネルが他のユーザーに連携されていないかチェック
    const { data: existingByChannelId } = await adminClient
      .from("youtube_user_connections")
      .select("user_id")
      .eq("channel_id", channel.id)
      .maybeSingle();

    if (existingByChannelId && existingByChannelId.user_id !== user.id) {
      return {
        success: false,
        error:
          "このYouTubeチャンネルは既に別のユーザーに連携されています。別のアカウントをお試しください。",
      };
    }

    // youtube_user_connectionsテーブルに保存
    const { error: upsertError } = await adminClient
      .from("youtube_user_connections")
      .upsert(
        {
          user_id: user.id,
          google_user_id: channel.id,
          channel_id: channel.id,
          display_name: channel.title,
          avatar_url: channel.thumbnailUrl || null,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: new Date(
            Date.now() + tokens.expires_in * 1000,
          ).toISOString(),
          scopes: tokens.scope ? tokens.scope.split(" ") : null,
        },
        {
          onConflict: "user_id",
        },
      );

    if (upsertError) {
      console.error("Failed to save YouTube connection:", upsertError);
      return {
        success: false,
        error: "YouTube連携情報の保存に失敗しました",
      };
    }

    return {
      success: true,
      channel,
    };
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

    // youtube_user_connectionsテーブルから削除
    const adminClient = await createAdminClient();
    const { error: deleteError } = await adminClient
      .from("youtube_user_connections")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to unlink YouTube:", deleteError);
      return {
        success: false,
        error: "YouTube連携解除に失敗しました",
      };
    }

    return {
      success: true,
    };
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
export async function refreshYouTubeTokenAction(): Promise<YouTubeLinkResult> {
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

    // youtube_user_connectionsからリフレッシュトークンを取得
    const adminClient = await createAdminClient();
    const { data: connection, error: fetchError } = await adminClient
      .from("youtube_user_connections")
      .select("refresh_token")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !connection?.refresh_token) {
      return {
        success: false,
        error: "YouTubeが連携されていません",
      };
    }

    // Google APIでトークンをリフレッシュ
    const tokens = await refreshAccessToken(connection.refresh_token);

    // 新しいトークンを保存
    const { error: updateError } = await adminClient
      .from("youtube_user_connections")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000,
        ).toISOString(),
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
 * YouTube連携情報を取得する（内部用）
 */
export async function getYouTubeConnectionForUser(userId: string): Promise<{
  channelId: string;
  accessToken: string;
  displayName?: string;
  tokenExpiresAt: string;
} | null> {
  try {
    const adminClient = await createAdminClient();
    const { data: connection, error } = await adminClient
      .from("youtube_user_connections")
      .select("channel_id, access_token, display_name, token_expires_at")
      .eq("user_id", userId)
      .single();

    if (error || !connection) {
      return null;
    }

    return {
      channelId: connection.channel_id,
      accessToken: connection.access_token,
      displayName: connection.display_name ?? undefined,
      tokenExpiresAt: connection.token_expires_at,
    };
  } catch {
    return null;
  }
}
