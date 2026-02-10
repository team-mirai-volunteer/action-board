/**
 * LINE APIトークンレスポンス
 */
export type LineTokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
};

/**
 * LINE APIクライアントのインターフェース（ポート）
 *
 * LINE OAuth2 APIとの通信を抽象化する。
 * テスト時にはFake実装に差し替え可能。
 */
export interface LineApiClient {
  exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<LineTokenResponse>;
}
