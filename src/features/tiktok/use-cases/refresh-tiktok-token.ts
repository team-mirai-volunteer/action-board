import type { SupabaseClient } from "@supabase/supabase-js";
import type { TikTokAuthClient } from "../types/tiktok-auth-client";
import { buildTokenUpdateData } from "../utils/data-builders";

export type RefreshTikTokTokenResult =
  | { success: true }
  | { success: false; error: string };

export async function refreshTikTokToken(
  supabase: SupabaseClient,
  tiktokAuthClient: TikTokAuthClient,
  userId: string,
): Promise<RefreshTikTokTokenResult> {
  // 1. tiktok_user_connectionsからリフレッシュトークンを取得
  const { data: connection, error: fetchError } = await supabase
    .from("tiktok_user_connections")
    .select("refresh_token")
    .eq("user_id", userId)
    .single();

  if (fetchError || !connection?.refresh_token) {
    return {
      success: false,
      error: "TikTokが連携されていません",
    };
  }

  // 2. TikTok APIでトークンをリフレッシュ
  const tokens = await tiktokAuthClient.refreshAccessToken(
    connection.refresh_token,
  );

  // 3. 新しいトークンを保存
  const { error: updateError } = await supabase
    .from("tiktok_user_connections")
    .update(buildTokenUpdateData(tokens))
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update refreshed token:", updateError);
    return {
      success: false,
      error: "トークンの保存に失敗しました",
    };
  }

  return { success: true };
}
