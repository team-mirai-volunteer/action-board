import type { TikTokTokenResponse, TikTokUser } from "@/features/tiktok/types";
import type { TikTokAuthClient } from "@/features/tiktok/types/tiktok-auth-client";

/**
 * テスト用のFake TikTok認証APIクライアント
 *
 * 実際のTikTok APIを呼ばず、コンストラクタで渡されたユーザー情報から
 * 固定のトークンとユーザー情報を返す。
 */
export class FakeTikTokAuthClient implements TikTokAuthClient {
  constructor(
    private readonly openId: string,
    private readonly displayName: string = "テストTikTokユーザー",
    private readonly avatarUrl?: string,
  ) {}

  async exchangeCodeForToken(
    _code: string,
    _codeVerifier: string,
    _redirectUri: string,
  ): Promise<TikTokTokenResponse> {
    return {
      access_token: `fake-access-token-${this.openId}`,
      expires_in: 86400,
      open_id: this.openId,
      refresh_expires_in: 86400 * 30,
      refresh_token: `fake-refresh-token-${this.openId}`,
      scope: "user.info.basic,video.list",
      token_type: "Bearer",
    };
  }

  async refreshAccessToken(
    _refreshToken: string,
  ): Promise<TikTokTokenResponse> {
    return {
      access_token: `fake-refreshed-access-token-${this.openId}`,
      expires_in: 86400,
      open_id: this.openId,
      refresh_expires_in: 86400 * 30,
      refresh_token: `fake-refreshed-refresh-token-${this.openId}`,
      scope: "user.info.basic,video.list",
      token_type: "Bearer",
    };
  }

  async fetchUserInfo(_accessToken: string): Promise<TikTokUser> {
    return {
      open_id: this.openId,
      display_name: this.displayName,
      avatar_url: this.avatarUrl,
    };
  }
}
