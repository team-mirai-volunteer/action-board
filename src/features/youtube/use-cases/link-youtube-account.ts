import type { SupabaseClient } from "@supabase/supabase-js";
import { parseOAuthScopes } from "@/lib/utils/oauth-utils";
import { parseIdToken } from "../services/youtube-client";
import type { YouTubeChannel } from "../types";
import type { YouTubeAuthClient } from "../types/youtube-auth-client";

export type LinkYouTubeAccountInput = {
  userId: string;
  code: string;
  redirectUri: string;
};

export type LinkYouTubeAccountResult =
  | { success: true; channel: YouTubeChannel }
  | { success: false; error: string };

export async function linkYouTubeAccount(
  adminSupabase: SupabaseClient,
  youtubeAuthClient: YouTubeAuthClient,
  input: LinkYouTubeAccountInput,
): Promise<LinkYouTubeAccountResult> {
  // 1. Google APIでトークンと交換
  const tokens = await youtubeAuthClient.exchangeCodeForToken(
    input.code,
    input.redirectUri,
  );

  // 2. id_tokenからGoogleユーザーID (sub) を取得
  if (!tokens.id_token) {
    return {
      success: false,
      error: "Googleからid_tokenが返されませんでした",
    };
  }

  // 3. refresh_tokenの存在確認（NOT NULL制約違反を防ぐ）
  if (!tokens.refresh_token) {
    return {
      success: false,
      error:
        "Googleからリフレッシュトークンが取得できませんでした。お手数ですが、もう一度YouTube連携をお試しください。",
    };
  }

  const idTokenPayload = parseIdToken(tokens.id_token);
  const googleUserId = idTokenPayload.sub;

  // 4. YouTubeチャンネル情報を取得
  const channel = await youtubeAuthClient.fetchChannelInfo(tokens.access_token);

  // 5. 同じGoogleアカウントが他のユーザーに連携されていないかチェック
  const { data: existingByGoogleId } = await adminSupabase
    .from("youtube_user_connections")
    .select("user_id")
    .eq("google_user_id", googleUserId)
    .maybeSingle();

  if (existingByGoogleId && existingByGoogleId.user_id !== input.userId) {
    return {
      success: false,
      error:
        "このGoogleアカウントは既に別のユーザーに連携されています。別のGoogleアカウントをお試しください。",
    };
  }

  // 6. 同じYouTubeチャンネルが他のユーザーに連携されていないかチェック
  const { data: existingByChannelId } = await adminSupabase
    .from("youtube_user_connections")
    .select("user_id")
    .eq("channel_id", channel.id)
    .maybeSingle();

  if (existingByChannelId && existingByChannelId.user_id !== input.userId) {
    return {
      success: false,
      error:
        "このYouTubeチャンネルは既に別のユーザーに連携されています。別のアカウントをお試しください。",
    };
  }

  // 7. youtube_user_connectionsテーブルに保存
  const { error: upsertError } = await adminSupabase
    .from("youtube_user_connections")
    .upsert(
      {
        user_id: input.userId,
        google_user_id: googleUserId,
        channel_id: channel.id,
        display_name: channel.title,
        avatar_url: channel.thumbnailUrl || null,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000,
        ).toISOString(),
        scopes: tokens.scope ? parseOAuthScopes(tokens.scope) : null,
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
}
