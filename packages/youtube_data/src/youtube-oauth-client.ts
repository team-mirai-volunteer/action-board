import { google } from "googleapis";
import type { YouTubeVideoDetails } from "./types.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
}

/**
 * リフレッシュトークンからアクセストークンを更新する
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required",
    );
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token refresh failed: ${errorBody}`);
  }

  const tokens: TokenResponse = await response.json();
  return {
    ...tokens,
    refresh_token: tokens.refresh_token || refreshToken,
  };
}

/**
 * OAuth認証済みのYouTubeクライアントを作成
 */
function getOAuthYouTubeClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
}

/**
 * ユーザーがいいねした動画の一覧を取得する
 * @param accessToken OAuth アクセストークン
 * @param maxResults 取得する最大件数
 * @returns いいねした動画の詳細情報配列
 */
export async function fetchUserLikedVideos(
  accessToken: string,
  maxResults = 100,
): Promise<YouTubeVideoDetails[]> {
  const youtube = getOAuthYouTubeClient(accessToken);
  const allVideos: YouTubeVideoDetails[] = [];
  let pageToken: string | undefined;

  while (allVideos.length < maxResults) {
    const response = await youtube.videos.list({
      part: ["snippet", "statistics", "contentDetails"],
      myRating: "like",
      maxResults: Math.min(50, maxResults - allVideos.length),
      pageToken,
    });

    const items = response.data.items as YouTubeVideoDetails[] | undefined;
    if (!items || items.length === 0) {
      break;
    }

    allVideos.push(...items);

    pageToken = response.data.nextPageToken ?? undefined;
    if (!pageToken) {
      break;
    }
  }

  return allVideos;
}
