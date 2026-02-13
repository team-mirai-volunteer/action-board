import type { SupabaseClient } from "@supabase/supabase-js";
import type { TikTokUser } from "../types";
import type { TikTokAuthClient } from "../types/tiktok-auth-client";
import { buildTikTokConnectionUpsertData } from "../utils/data-builders";

export type LinkTikTokAccountInput = {
  userId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

export type LinkTikTokAccountResult =
  | { success: true; user: TikTokUser }
  | { success: false; error: string };

export async function linkTikTokAccount(
  supabase: SupabaseClient,
  tiktokAuthClient: TikTokAuthClient,
  input: LinkTikTokAccountInput,
): Promise<LinkTikTokAccountResult> {
  // 1. TikTok APIでトークンと交換
  const tokens = await tiktokAuthClient.exchangeCodeForToken(
    input.code,
    input.codeVerifier,
    input.redirectUri,
  );

  // 2. TikTokユーザー情報を取得
  const tiktokUser = await tiktokAuthClient.fetchUserInfo(tokens.access_token);

  // 3. 同じTikTokアカウントが他のユーザーに連携されていないかチェック
  const { data: existingConnection } = await supabase
    .from("tiktok_user_connections")
    .select("user_id")
    .eq("tiktok_open_id", tiktokUser.open_id)
    .maybeSingle();

  if (existingConnection && existingConnection.user_id !== input.userId) {
    return {
      success: false,
      error:
        "このTikTokアカウントは既に別のユーザーに連携されています。別のTikTokアカウントをお試しください。",
    };
  }

  // 4. tiktok_user_connectionsテーブルに保存
  const { error: upsertError } = await supabase
    .from("tiktok_user_connections")
    .upsert(buildTikTokConnectionUpsertData(input.userId, tokens, tiktokUser), {
      onConflict: "user_id",
    });

  if (upsertError) {
    console.error("Failed to save TikTok connection:", upsertError);
    return {
      success: false,
      error: "TikTok連携情報の保存に失敗しました",
    };
  }

  return { success: true, user: tiktokUser };
}
