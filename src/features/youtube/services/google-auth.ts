/**
 * Google認証関連の共通ロジック
 */

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * Googleトークン更新時のエラー
 * error: Google OAuth error code (e.g. "invalid_grant")
 * errorDescription: 詳細メッセージ (e.g. "Account has been deleted")
 */
export class GoogleTokenRefreshError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly errorDescription: string,
  ) {
    super(`Google token refresh failed: ${errorCode} - ${errorDescription}`);
    this.name = "GoogleTokenRefreshError";
  }
}

/** ユーザー起因で再試行しても回復しないエラーコード */
const EXPECTED_TOKEN_ERROR_CODES = new Set([
  "invalid_grant", // アカウント削除、トークンrevoke、長期間未使用
]);

/**
 * Googleトークンレスポンス
 */
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
  id_token?: string;
}

/**
 * Google API クライアント設定を取得
 */
export function getGoogleClientConfig(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required",
    );
  }

  return { clientId, clientSecret };
}

/**
 * リフレッシュトークンでアクセストークンを更新する
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getGoogleClientConfig();

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
    let errorCode = "unknown";
    let errorDescription = `HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      errorCode = errorJson.error || errorCode;
      errorDescription = errorJson.error_description || errorDescription;
    } catch {
      // JSONパース失敗時はデフォルト値を使用
    }
    console.error(
      `Google token refresh failed: ${errorCode} - ${errorDescription}`,
    );
    throw new GoogleTokenRefreshError(errorCode, errorDescription);
  }

  const tokens: GoogleTokenResponse = await response.json();

  // refresh_token は更新時には返ってこないことがあるので、元のを保持
  return {
    ...tokens,
    refresh_token: tokens.refresh_token || refreshToken,
  };
}

/**
 * トークンが期限切れかどうかをチェックする
 */
export function isTokenExpired(tokenExpiresAt: string): boolean {
  return new Date(tokenExpiresAt) < new Date();
}

/**
 * GoogleTokenRefreshErrorかつ想定内のエラーコードかどうかを判定する
 */
export function isExpectedTokenError(error: unknown): boolean {
  return (
    error instanceof GoogleTokenRefreshError &&
    EXPECTED_TOKEN_ERROR_CODES.has(error.errorCode)
  );
}
