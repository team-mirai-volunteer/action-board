import type {
  LineApiClient,
  LineTokenResponse,
} from "@/features/auth/types/line-api-client";

/**
 * テスト用のFake LINE APIクライアント
 *
 * 実際のLINE APIを呼ばず、コンストラクタで渡されたユーザー情報から
 * Base64エンコードした偽JWTを返す。parseIdTokenPayloadでデコード可能。
 */
export class FakeLineApiClient implements LineApiClient {
  constructor(
    private readonly lineUserId: string,
    private readonly name?: string,
    private readonly email?: string,
    private readonly picture?: string,
  ) {}

  async exchangeCodeForTokens(
    _code: string,
    _redirectUri: string,
  ): Promise<LineTokenResponse> {
    const payload = {
      sub: this.lineUserId,
      name: this.name ?? "テストLINEユーザー",
      email: this.email,
      picture: this.picture,
    };

    // header.payload.signature 形式の偽JWT（parseIdTokenPayloadはpayload部分のみデコード）
    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
      "base64url",
    );
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const idToken = `${header}.${body}.fake-signature`;

    return {
      access_token: `fake-access-token-${this.lineUserId}`,
      token_type: "Bearer",
      id_token: idToken,
    };
  }
}
