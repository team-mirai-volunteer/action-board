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
 * いいねした動画のAPIレスポンス型
 */
export interface LikedVideoItem {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    channelTitle: string;
    title: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
    };
  };
}

/**
 * ユーザーがいいねした動画一覧を取得する
 * @param accessToken OAuth アクセストークン
 * @param maxResults 取得する最大件数（デフォルト50）
 */
export async function fetchUserLikedVideos(
  accessToken: string,
  maxResults = 50,
): Promise<LikedVideoItem[]> {
  const likedVideos: LikedVideoItem[] = [];
  let pageToken: string | undefined;

  while (likedVideos.length < maxResults) {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("myRating", "like");
    url.searchParams.set(
      "maxResults",
      String(Math.min(50, maxResults - likedVideos.length)),
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
      throw new YouTubeAPIError("いいねした動画の取得に失敗しました");
    }

    const data = await response.json();
    const items = data.items as LikedVideoItem[] | undefined;

    if (!items || items.length === 0) {
      break;
    }

    likedVideos.push(...items);

    pageToken = data.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  return likedVideos;
}

/**
 * コメントスレッドの型定義
 */
export interface CommentThread {
  id: string;
  snippet: {
    videoId: string;
    topLevelComment: {
      id: string;
      snippet: {
        videoId: string;
        textDisplay: string;
        textOriginal: string;
        authorDisplayName: string;
        authorChannelId: { value: string };
        publishedAt: string;
      };
    };
  };
}

/**
 * 動画のコメント一覧を取得する（API Key使用）
 * @param videoId YouTube動画ID
 * @param maxResults 取得する最大件数（デフォルト100、最大500）
 * @param publishedAfter この日時以降のコメントのみ取得（差分同期用）
 */
export async function fetchVideoComments(
  videoId: string,
  maxResults = 100,
  publishedAfter?: Date,
): Promise<CommentThread[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not configured");
    return [];
  }

  const comments: CommentThread[] = [];
  let pageToken: string | undefined;

  while (comments.length < maxResults) {
    const url = new URL(`${YOUTUBE_API_BASE}/commentThreads`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set(
      "maxResults",
      String(Math.min(100, maxResults - comments.length)),
    );
    url.searchParams.set("order", "time"); // 最新順
    url.searchParams.set("textFormat", "plainText");
    url.searchParams.set("key", apiKey);
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      // コメントが無効化されている動画などはエラーになるので、空配列を返す
      if (response.status === 403) {
        console.log(`Comments disabled for video ${videoId}`);
        return [];
      }
      console.error(
        `YouTube comments fetch failed for video ${videoId}:`,
        errorBody,
      );
      throw new YouTubeAPIError("コメントの取得に失敗しました");
    }

    const data = await response.json();
    const items = data.items as CommentThread[] | undefined;

    if (!items || items.length === 0) {
      break;
    }

    // 差分同期: publishedAfter以前のコメントが出てきたら終了
    let reachedOldComments = false;
    for (const item of items) {
      const commentDate = new Date(
        item.snippet.topLevelComment.snippet.publishedAt,
      );
      if (publishedAfter && commentDate <= publishedAfter) {
        reachedOldComments = true;
        break;
      }
      comments.push(item);
    }

    if (reachedOldComments) {
      break;
    }

    pageToken = data.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  return comments;
}

/**
 * API Keyを使って動画の詳細情報を取得する（公開動画のみ）
 * ユーザー認証不要で公開情報を取得できる
 * @param videoIds 動画IDの配列
 */
export async function fetchVideoDetailsByApiKey(
  videoIds: string[],
): Promise<YouTubeVideoDetail[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY is not configured");
    return [];
  }

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
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("YouTube video details fetch (API key) failed:", errorBody);
      // API keyでの取得に失敗しても続行
      continue;
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
 * YouTube Client オブジェクト
 * 全てのYouTube API呼び出しをまとめたインターフェース
 */
export const youtubeClient = {
  exchangeCodeForToken,
  refreshAccessToken,
  fetchChannelInfo,
  fetchUserUploadedVideos,
  fetchVideoDetails,
  fetchVideoDetailsByApiKey,
  fetchUserLikedVideos,
  fetchVideoComments,
};
