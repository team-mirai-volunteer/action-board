/**
 * TikTok API クライアント（バッチ処理用）
 */

import type {
  TikTokTokenResponse,
  TikTokVideoFromAPI,
  TikTokVideoListResponse,
} from "./types.js";

const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";
const MAX_VIDEO_LIST_RETRIES = 3;
const VIDEO_LIST_RETRY_DELAY_MS = 1000;
const RETRYABLE_VIDEO_LIST_ERROR_CODES = ["internal_error"];

/**
 * TikTok API クライアント設定を取得
 */
function getClientConfig(): { clientKey: string; clientSecret: string } {
  const clientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    throw new Error(
      "NEXT_PUBLIC_TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET environment variables are required",
    );
  }

  return { clientKey, clientSecret };
}

/**
 * TikTok API エラー
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

export function parseApiErrorResponse(errorText: string): {
  code?: string;
  message?: string;
  logId?: string;
} {
  try {
    const errorJson = JSON.parse(errorText);
    return {
      code: errorJson.error?.code,
      message: errorJson.error?.message,
      logId: errorJson.error?.log_id,
    };
  } catch {
    return {};
  }
}

export function isRetryableVideoListError(code?: string): boolean {
  if (!code) {
    return false;
  }
  return RETRYABLE_VIDEO_LIST_ERROR_CODES.includes(code);
}

async function waitForRetry(attempt: number): Promise<void> {
  const delayMs = VIDEO_LIST_RETRY_DELAY_MS * attempt;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
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

  if (!tokens.access_token) {
    throw new TikTokAPIError(
      "トークンの更新に失敗しました（access_tokenがありません）",
    );
  }

  return tokens;
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

  for (let attempt = 1; attempt <= MAX_VIDEO_LIST_RETRIES; attempt++) {
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

      const {
        code: errorCode,
        message: errorMessage,
        logId,
      } = parseApiErrorResponse(errorText);

      if (
        isRetryableVideoListError(errorCode) &&
        attempt < MAX_VIDEO_LIST_RETRIES
      ) {
        console.warn(
          `Retrying TikTok video list fetch (attempt ${attempt}/${MAX_VIDEO_LIST_RETRIES}) due to retryable error: ${errorCode}`,
        );
        await waitForRetry(attempt);
        continue;
      }

      throw new TikTokAPIError(
        errorMessage || "TikTok動画一覧の取得に失敗しました",
        errorCode,
        logId,
      );
    }

    const data: TikTokVideoListResponse = await response.json();

    if (data.error?.code && data.error.code !== "ok") {
      console.error("TikTok API error:", data.error);

      if (
        isRetryableVideoListError(data.error.code) &&
        attempt < MAX_VIDEO_LIST_RETRIES
      ) {
        console.warn(
          `Retrying TikTok video list fetch (attempt ${attempt}/${MAX_VIDEO_LIST_RETRIES}) due to retryable API error: ${data.error.code}`,
        );
        await waitForRetry(attempt);
        continue;
      }

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

  throw new TikTokAPIError(
    "TikTok動画一覧の取得に失敗しました（リトライ上限到達）",
  );
}

/**
 * #チームみらい を検出する正規表現
 */
const TEAM_MIRAI_REGEX = /#(チームみらい|teammirai)/i;

/**
 * #チームみらい 動画をフィルタリングする
 */
export function filterTeamMiraiVideos(
  videos: TikTokVideoFromAPI[],
): TikTokVideoFromAPI[] {
  return videos.filter((video) => {
    const description = video.video_description || "";
    const title = video.title || "";
    return TEAM_MIRAI_REGEX.test(description) || TEAM_MIRAI_REGEX.test(title);
  });
}

/**
 * テキストからハッシュタグを抽出する
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g);
  return matches || [];
}
