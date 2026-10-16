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
 * LINE IDトークン（JWT）の検証済みペイロード
 * https://developers.line.biz/ja/reference/line-login/#verify-id-token
 */
export type LineIdTokenPayload = {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
  amr?: string[];
  name?: string;
  picture?: string;
  email?: string;
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

  /**
   * IDトークンを LINE の verify エンドポイントで検証し、検証済みペイロードを返す。
   * 署名・aud（channel ID）・iss・exp を LINE 側で検証する。
   */
  verifyIdToken(idToken: string): Promise<LineIdTokenPayload>;
}
