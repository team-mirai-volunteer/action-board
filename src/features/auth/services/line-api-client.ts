import type {
  LineApiClient,
  LineIdTokenPayload,
  LineTokenResponse,
} from "../types/line-api-client";

export class LineApiClientImpl implements LineApiClient {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ): Promise<LineTokenResponse> {
    const response = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to get access token: ${response.status} ${errorBody}`,
      );
    }

    return response.json();
  }

  async verifyIdToken(idToken: string): Promise<LineIdTokenPayload> {
    // LINE の verify エンドポイントで署名・aud（channel ID）・iss・exp を検証する。
    const response = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        id_token: idToken,
        client_id: this.clientId,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Failed to verify ID token: ${response.status} ${errorBody}`,
      );
    }

    return response.json();
  }
}
