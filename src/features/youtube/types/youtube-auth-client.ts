import type { GoogleTokenResponse, YouTubeChannel } from "./index";

/**
 * YouTube認証APIクライアントのインターフェース（ポート）
 *
 * Google OAuth2 API / YouTube Data APIとの通信を抽象化する。
 * テスト時にはFake実装に差し替え可能。
 */
export interface YouTubeAuthClient {
  exchangeCodeForToken(
    code: string,
    redirectUri: string,
  ): Promise<GoogleTokenResponse>;

  refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse>;

  fetchChannelInfo(accessToken: string): Promise<YouTubeChannel>;
}
