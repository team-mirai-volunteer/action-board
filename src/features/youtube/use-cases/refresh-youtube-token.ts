import type { SupabaseClient } from "@supabase/supabase-js";
import type { YouTubeAuthClient } from "../types/youtube-auth-client";

export type RefreshYouTubeTokenResult =
  | { success: true; accessToken: string }
  | { success: false; error: string };

export async function refreshYouTubeToken(
  adminSupabase: SupabaseClient,
  youtubeAuthClient: YouTubeAuthClient,
  userId: string,
): Promise<RefreshYouTubeTokenResult> {
  // 1. youtube_user_connectionsからリフレッシュトークンを取得
  const { data: connection, error: fetchError } = await adminSupabase
    .from("youtube_user_connections")
    .select("refresh_token")
    .eq("user_id", userId)
    .single();

  if (fetchError || !connection?.refresh_token) {
    return {
      success: false,
      error: "YouTubeが連携されていません",
    };
  }

  // 2. Google APIでトークンをリフレッシュ
  const tokens = await youtubeAuthClient.refreshAccessToken(
    connection.refresh_token,
  );

  // 3. 新しいトークンを保存
  const { error: updateError } = await adminSupabase
    .from("youtube_user_connections")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(
        Date.now() + tokens.expires_in * 1000,
      ).toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update refreshed token:", updateError);
    return {
      success: false,
      error: "トークンの保存に失敗しました",
    };
  }

  return {
    success: true,
    accessToken: tokens.access_token,
  };
}
