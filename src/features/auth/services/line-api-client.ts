import type {
  LineApiClient,
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
}
