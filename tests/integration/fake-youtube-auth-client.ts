import type {
  GoogleTokenResponse,
  YouTubeChannel,
} from "@/features/youtube/types";
import type { YouTubeAuthClient } from "@/features/youtube/types/youtube-auth-client";

/**
 * テスト用のFake YouTube認証クライアント
 *
 * 実際のGoogle/YouTube APIを呼ばず、コンストラクタで渡された情報から
 * 偽のトークン・チャンネル情報を返す。
 */
export class FakeYouTubeAuthClient implements YouTubeAuthClient {
  constructor(
    private readonly googleUserId: string,
    private readonly channelId: string,
    private readonly channelTitle: string = "テストチャンネル",
    private readonly thumbnailUrl?: string,
  ) {}

  async exchangeCodeForToken(
    _code: string,
    _redirectUri: string,
  ): Promise<GoogleTokenResponse> {
    // id_tokenの偽JWT（parseIdTokenでデコード可能）
    const payload = {
      iss: "https://accounts.google.com",
      sub: this.googleUserId,
      aud: "fake-client-id",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    };

    const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
      "base64url",
    );
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const idToken = `${header}.${body}.fake-signature`;

    return {
      access_token: `fake-access-token-${this.googleUserId}`,
      expires_in: 3600,
      refresh_token: `fake-refresh-token-${this.googleUserId}`,
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      token_type: "Bearer",
      id_token: idToken,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
    return {
      access_token: `fake-refreshed-access-token-${this.googleUserId}`,
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      token_type: "Bearer",
    };
  }

  async fetchChannelInfo(_accessToken: string): Promise<YouTubeChannel> {
    return {
      id: this.channelId,
      title: this.channelTitle,
      description: "テスト用チャンネル説明",
      thumbnailUrl: this.thumbnailUrl,
    };
  }
}
