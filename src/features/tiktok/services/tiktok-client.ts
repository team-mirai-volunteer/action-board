import "server-only";

import type {
  TikTokTokenResponse,
  TikTokUser,
  TikTokUserInfoResponse,
  TikTokVideoFromAPI,
  TikTokVideoListResponse,
} from "../types";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";

/**
 * TikTok API クライアント設定を取得
 */
function getClientConfig(): { clientKey: string; clientSecret: string } {
  const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    throw new Error("TikTok認証の設定が不完全です");
  }

  return { clientKey, clientSecret };
}

/**
 * TikTok API エラーレスポンス
 */
export class TikTokAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public logId?: string,
  ) {
    super(message);
    this.name = "TikTokAPIError";
  }
}

/**
 * 認証コードをアクセストークンに交換する
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = getClientConfig();

  const response = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
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
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("TikTok token exchange failed:", errorBody);
    throw new TikTokAPIError("TikTokとの認証に失敗しました");
  }

  const tokens: TikTokTokenResponse = await response.json();

  if (!tokens.access_token || !tokens.open_id) {
    console.error("Invalid TikTok token response:", tokens);
    throw new TikTokAPIError("TikTokからの応答が不正です");
  }

  return tokens;
}

/**
 * リフレッシュトークンでアクセストークンを更新する
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = getClientConfig();

  const response = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
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
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("TikTok token refresh failed:", errorBody);
    throw new TikTokAPIError("TikTokトークンの更新に失敗しました");
  }

  const tokens: TikTokTokenResponse = await response.json();

  return tokens;
}

/**
 * ユーザー情報を取得する
 */
export async function fetchUserInfo(accessToken: string): Promise<TikTokUser> {
  const response = await fetch(
    `${TIKTOK_API_BASE}/user/info/?fields=open_id,union_id,avatar_url,display_name`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("TikTok user info failed:", errorBody);
    throw new TikTokAPIError("TikTokユーザー情報の取得に失敗しました");
  }

  const userInfoData: TikTokUserInfoResponse = await response.json();

  if (userInfoData.error?.code && userInfoData.error.code !== "ok") {
    console.error("TikTok user info error:", userInfoData.error);
    throw new TikTokAPIError(
      `TikTokエラー: ${userInfoData.error.message}`,
      userInfoData.error.code,
      userInfoData.error.log_id,
    );
  }

  return userInfoData.data.user;
}

/**
 * ユーザーの動画一覧を取得する
 */
export async function fetchVideoList(
  accessToken: string,
  cursor?: number,
  maxCount = 20,
): Promise<{
  videos: TikTokVideoFromAPI[];
  hasMore: boolean;
  cursor: number;
}> {
  const fields = [
    "id",
    "create_time",
    "cover_image_url",
    "share_url",
    "video_description",
    "duration",
    "title",
    "like_count",
    "comment_count",
    "share_count",
    "view_count",
  ].join(",");

  const url = new URL(`${TIKTOK_API_BASE}/video/list/`);
  url.searchParams.set("fields", fields);

  const body: Record<string, number> = {
    max_count: maxCount,
  };
  if (cursor) {
    body.cursor = cursor;
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("TikTok video list fetch failed:", errorText);
    throw new TikTokAPIError("TikTok動画一覧の取得に失敗しました");
  }

  const data: TikTokVideoListResponse = await response.json();

  if (data.error?.code && data.error.code !== "ok") {
    console.error("TikTok API error:", data.error);
    throw new TikTokAPIError(
      `TikTok APIエラー: ${data.error.message}`,
      data.error.code,
      data.error.log_id,
    );
  }

  return {
    videos: data.data.videos || [],
    hasMore: data.data.has_more,
    cursor: data.data.cursor,
  };
}

/**
 * TikTok Client オブジェクト
 * 全てのTikTok API呼び出しをまとめたインターフェース
 */
export const tiktokClient = {
  exchangeCodeForToken,
  refreshAccessToken,
  fetchUserInfo,
  fetchVideoList,
};
