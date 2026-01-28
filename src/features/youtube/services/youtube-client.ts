import "server-only";

import type {
  GoogleTokenResponse,
  YouTubeChannel,
  YouTubeChannelResponse,
} from "../types";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Google API クライアント設定を取得
 */
function getClientConfig(): { clientId: string; clientSecret: string } {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google認証の設定が不完全です");
  }

  return { clientId, clientSecret };
}

/**
 * YouTube API エラーレスポンス
 */
export class YouTubeAPIError extends Error {
  constructor(
    message: string,
    public code?: number,
    public reason?: string,
  ) {
    super(message);
    this.name = "YouTubeAPIError";
  }
}

/**
 * id_token (JWT) のペイロード型
 */
interface IdTokenPayload {
  iss: string; // Issuer
  sub: string; // Subject (Google User ID)
  aud: string; // Audience (Client ID)
  exp: number; // Expiration time
  iat: number; // Issued at
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

/**
 * id_token (JWT) をパースしてペイロードを取得する
 * 注意: これは署名検証なしの簡易パースです。
 * Googleのid_tokenは既にGoogle OAuth経由で取得しているため、
 * トークン自体の信頼性は担保されています。
 */
export function parseIdToken(idToken: string): IdTokenPayload {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new YouTubeAPIError("Invalid id_token format");
    }

    // Base64URL デコード
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded) as IdTokenPayload;

    if (!parsed.sub) {
      throw new YouTubeAPIError("id_token does not contain sub claim");
    }

    return parsed;
  } catch (error) {
    if (error instanceof YouTubeAPIError) {
      throw error;
    }
    throw new YouTubeAPIError("Failed to parse id_token");
  }
}

/**
 * 認証コードをアクセストークンに交換する
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getClientConfig();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Google token exchange failed:", errorBody);
    throw new YouTubeAPIError("Googleとの認証に失敗しました");
  }

  const tokens: GoogleTokenResponse = await response.json();

  if (!tokens.access_token) {
    console.error("Invalid Google token response:", tokens);
    throw new YouTubeAPIError("Googleからの応答が不正です");
  }

  return tokens;
}

/**
 * リフレッシュトークンでアクセストークンを更新する
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getClientConfig();

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
    console.error("Google token refresh failed:", errorBody);
    throw new YouTubeAPIError("Googleトークンの更新に失敗しました");
  }

  const tokens: GoogleTokenResponse = await response.json();

  // refresh_token は更新時には返ってこないことがあるので、元のを保持
  return {
    ...tokens,
    refresh_token: tokens.refresh_token || refreshToken,
  };
}

/**
 * YouTubeチャンネル情報を取得する
 * 複数チャンネルがある場合は最初の1つを返す
 */
export async function fetchChannelInfo(
  accessToken: string,
): Promise<YouTubeChannel> {
  const url = new URL(`${YOUTUBE_API_BASE}/channels`);
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("mine", "true");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("YouTube channel info failed:", errorBody);
    throw new YouTubeAPIError("YouTubeチャンネル情報の取得に失敗しました");
  }

  const data: YouTubeChannelResponse = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new YouTubeAPIError(
      "YouTubeチャンネルが見つかりません。YouTubeアカウントにチャンネルが作成されているか確認してください。",
    );
  }

  // 複数チャンネルがある場合は最初の1つを使用
  const channel = data.items[0];

  return {
    id: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    customUrl: channel.snippet.customUrl,
    thumbnailUrl:
      channel.snippet.thumbnails.medium?.url ||
      channel.snippet.thumbnails.default?.url,
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
  };
}

/**
 * YouTube動画の詳細情報
 */
export interface YouTubeVideoDetail {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    tags?: string[];
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

/**
 * プレイリストアイテム
 */
interface PlaylistItem {
  snippet: {
    resourceId: {
      videoId: string;
    };
  };
}

/**
 * ユーザーのアップロード動画一覧を取得する
 * @param accessToken OAuth アクセストークン
 * @param uploadsPlaylistId チャンネルのアップロードプレイリストID
 * @param maxResults 取得する最大件数（デフォルト50）
 */
export async function fetchUserUploadedVideos(
  accessToken: string,
  uploadsPlaylistId: string,
  maxResults = 50,
): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (videoIds.length < maxResults) {
    const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set(
      "maxResults",
      String(Math.min(50, maxResults - videoIds.length)),
    );
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("YouTube playlist items fetch failed:", errorBody);
      throw new YouTubeAPIError("アップロード動画一覧の取得に失敗しました");
    }

    const data = await response.json();
    const items = data.items as PlaylistItem[] | undefined;

    if (!items || items.length === 0) {
      break;
    }

    for (const item of items) {
      if (item.snippet?.resourceId?.videoId) {
        videoIds.push(item.snippet.resourceId.videoId);
      }
    }

    pageToken = data.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  return videoIds;
}

/**
 * 動画の詳細情報を取得する（統計情報含む）
 * @param accessToken OAuth アクセストークン
 * @param videoIds 動画IDの配列
 */
export async function fetchVideoDetails(
  accessToken: string,
  videoIds: string[],
): Promise<YouTubeVideoDetail[]> {
  if (videoIds.length === 0) {
    return [];
  }

  const allDetails: YouTubeVideoDetail[] = [];

  // YouTube API は1リクエストで50件まで
  const chunkSize = 50;
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    const chunk = videoIds.slice(i, i + chunkSize);

    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,statistics,contentDetails");
    url.searchParams.set("id", chunk.join(","));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("YouTube video details fetch failed:", errorBody);
      throw new YouTubeAPIError("動画詳細情報の取得に失敗しました");
    }

    const data = await response.json();
    const items = data.items as YouTubeVideoDetail[] | undefined;
    if (items) {
      allDetails.push(...items);
    }
  }

  return allDetails;
}

/**
 * ユーザーがいいねした動画の一覧を取得する
 * YouTube Data API v3 の videos?myRating=like エンドポイントを使用
 * @param accessToken OAuth アクセストークン
 * @param maxResults 取得する最大件数（デフォルト50）
 * @returns いいねした動画の詳細情報配列
 */
export async function fetchUserLikedVideos(
  accessToken: string,
  maxResults = 50,
): Promise<YouTubeVideoDetail[]> {
  const allVideos: YouTubeVideoDetail[] = [];
  let pageToken: string | undefined;

  while (allVideos.length < maxResults) {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,statistics,contentDetails");
    url.searchParams.set("myRating", "like");
    url.searchParams.set(
      "maxResults",
      String(Math.min(50, maxResults - allVideos.length)),
    );
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("YouTube liked videos fetch failed:", errorBody);

      // 401/403エラーの場合は特別なエラーを投げる
      if (response.status === 401 || response.status === 403) {
        throw new YouTubeAPIError(
          "YouTube認証が無効です。再度連携してください。",
          response.status,
          "auth_error",
        );
      }

      throw new YouTubeAPIError("いいね動画一覧の取得に失敗しました");
    }

    const data = await response.json();
    const items = data.items as YouTubeVideoDetail[] | undefined;

    if (!items || items.length === 0) {
      break;
    }

    allVideos.push(...items);

    pageToken = data.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  return allVideos;
}

/**
 * YouTube Client オブジェクト
 * 全てのYouTube API呼び出しをまとめたインターフェース
 */
export const youtubeClient = {
  exchangeCodeForToken,
  refreshAccessToken,
  fetchChannelInfo,
  fetchUserUploadedVideos,
  fetchVideoDetails,
  fetchUserLikedVideos,
};
