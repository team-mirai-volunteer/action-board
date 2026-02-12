import type { TikTokTokenResponse, TikTokUser } from "./index";

/**
 * TikTok認証APIクライアントのインターフェース（ポート）
 *
 * TikTok OAuth2 APIとの通信を抽象化する。
 * テスト時にはFake実装に差し替え可能。
 */
export interface TikTokAuthClient {
  exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<TikTokTokenResponse>;

  refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse>;

  fetchUserInfo(accessToken: string): Promise<TikTokUser>;
}
