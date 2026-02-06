import type {
  TikTokTokenResponse,
  TikTokUser,
  TikTokVideoFromAPI,
} from "../types";
import {
  buildTikTokConnectionUpsertData,
  buildTikTokVideoInsertData,
  buildTikTokVideoUpdateData,
  buildTokenUpdateData,
} from "./data-builders";

const baseTokenResponse: TikTokTokenResponse = {
  access_token: "access_token_123",
  expires_in: 86400,
  open_id: "open_id_123",
  refresh_expires_in: 7776000,
  refresh_token: "refresh_token_123",
  scope: "user.info.basic,video.list",
  token_type: "Bearer",
};

const baseTikTokUser: TikTokUser = {
  open_id: "open_id_123",
  display_name: "Test User",
  union_id: "union_id_456",
  avatar_url: "https://example.com/avatar.jpg",
};

const baseVideo: TikTokVideoFromAPI = {
  id: "video_001",
  create_time: 1700000000,
  share_url: "https://www.tiktok.com/@user/video/video_001",
  video_description: "#チームみらい の活動 #政治",
  duration: 60,
  title: "テスト動画",
  cover_image_url: "https://example.com/cover.jpg",
  view_count: 1000,
  like_count: 50,
  comment_count: 10,
  share_count: 5,
};

describe("data-builders", () => {
  describe("buildTikTokConnectionUpsertData", () => {
    const fixedNow = new Date("2025-01-15T12:00:00.000Z");

    describe("正常系", () => {
      it("全フィールドが正しく構築される", () => {
        const result = buildTikTokConnectionUpsertData(
          "user_id_789",
          baseTokenResponse,
          baseTikTokUser,
          fixedNow,
        );

        expect(result).toEqual({
          user_id: "user_id_789",
          tiktok_open_id: "open_id_123",
          tiktok_union_id: "union_id_456",
          display_name: "Test User",
          avatar_url: "https://example.com/avatar.jpg",
          access_token: "access_token_123",
          refresh_token: "refresh_token_123",
          token_expires_at: new Date(
            fixedNow.getTime() + 86400 * 1000,
          ).toISOString(),
          refresh_token_expires_at: new Date(
            fixedNow.getTime() + 7776000 * 1000,
          ).toISOString(),
          scopes: ["user.info.basic", "video.list"],
        });
      });
    });

    describe("refresh_expires_inなし", () => {
      it("refresh_token_expires_atがnullになる", () => {
        const tokens: TikTokTokenResponse = {
          ...baseTokenResponse,
          refresh_expires_in: 0,
        };

        const result = buildTikTokConnectionUpsertData(
          "user_id_789",
          tokens,
          baseTikTokUser,
          fixedNow,
        );

        expect(result.refresh_token_expires_at).toBeNull();
      });
    });

    describe("scopeなし", () => {
      it("scopeが空文字の場合scopesがnullになる", () => {
        const tokens: TikTokTokenResponse = {
          ...baseTokenResponse,
          scope: "",
        };

        const result = buildTikTokConnectionUpsertData(
          "user_id_789",
          tokens,
          baseTikTokUser,
          fixedNow,
        );

        expect(result.scopes).toBeNull();
      });
    });

    describe("scope複数", () => {
      it("カンマ区切りで配列に分割される", () => {
        const tokens: TikTokTokenResponse = {
          ...baseTokenResponse,
          scope: "user.info.basic,video.list,video.upload",
        };

        const result = buildTikTokConnectionUpsertData(
          "user_id_789",
          tokens,
          baseTikTokUser,
          fixedNow,
        );

        expect(result.scopes).toEqual([
          "user.info.basic",
          "video.list",
          "video.upload",
        ]);
      });
    });

    describe("union_idなし", () => {
      it("tiktok_union_idがnullになる", () => {
        const user: TikTokUser = {
          open_id: "open_id_123",
          display_name: "Test User",
        };

        const result = buildTikTokConnectionUpsertData(
          "user_id_789",
          baseTokenResponse,
          user,
          fixedNow,
        );

        expect(result.tiktok_union_id).toBeNull();
      });
    });
  });

  describe("buildTokenUpdateData", () => {
    const fixedNow = new Date("2025-01-15T12:00:00.000Z");

    describe("正常系", () => {
      it("全フィールドが正しく構築される", () => {
        const tokens = {
          access_token: "new_access_token",
          refresh_token: "new_refresh_token",
          expires_in: 86400,
          refresh_expires_in: 7776000,
        };

        const result = buildTokenUpdateData(tokens, fixedNow);

        expect(result).toEqual({
          access_token: "new_access_token",
          refresh_token: "new_refresh_token",
          token_expires_at: new Date(
            fixedNow.getTime() + 86400 * 1000,
          ).toISOString(),
          refresh_token_expires_at: new Date(
            fixedNow.getTime() + 7776000 * 1000,
          ).toISOString(),
        });
      });
    });

    describe("refresh_expires_inあり", () => {
      it("refresh_token_expires_atが正しく計算される", () => {
        const tokens = {
          access_token: "token",
          refresh_token: "refresh",
          expires_in: 3600,
          refresh_expires_in: 86400,
        };

        const result = buildTokenUpdateData(tokens, fixedNow);

        const expectedExpiry = new Date(
          fixedNow.getTime() + 86400 * 1000,
        ).toISOString();
        expect(result.refresh_token_expires_at).toBe(expectedExpiry);
      });
    });

    describe("refresh_expires_inなし", () => {
      it("refresh_token_expires_atがnullになる", () => {
        const tokens = {
          access_token: "token",
          refresh_token: "refresh",
          expires_in: 3600,
          refresh_expires_in: 0,
        };

        const result = buildTokenUpdateData(tokens, fixedNow);

        expect(result.refresh_token_expires_at).toBeNull();
      });
    });

    describe("有効期限の正確性", () => {
      it("expires_inの秒数がミリ秒に正しく変換される", () => {
        const tokens = {
          access_token: "token",
          refresh_token: "refresh",
          expires_in: 7200,
          refresh_expires_in: 0,
        };

        const result = buildTokenUpdateData(tokens, fixedNow);

        const expectedExpiry = new Date(
          fixedNow.getTime() + 7200 * 1000,
        ).toISOString();
        expect(result.token_expires_at).toBe(expectedExpiry);
      });
    });
  });

  describe("buildTikTokVideoInsertData", () => {
    describe("全フィールドあり", () => {
      it("全フィールドが正しく構築される", () => {
        const result = buildTikTokVideoInsertData(
          baseVideo,
          "user_001",
          "creator_001",
          "testuser",
        );

        expect(result).toEqual({
          video_id: "video_001",
          user_id: "user_001",
          creator_id: "creator_001",
          creator_username: "testuser",
          title: "テスト動画",
          description: "#チームみらい の活動 #政治",
          thumbnail_url: "https://example.com/cover.jpg",
          video_url: "https://www.tiktok.com/@user/video/video_001",
          published_at: new Date(1700000000 * 1000).toISOString(),
          duration: 60,
          tags: ["#チームみらい", "#政治"],
          is_active: true,
        });
      });
    });

    describe("optionalフィールドなし", () => {
      it("optionalフィールドがnullになる", () => {
        const video: TikTokVideoFromAPI = {
          id: "video_002",
          create_time: 0,
          share_url: "https://www.tiktok.com/@user/video/video_002",
          duration: 30,
        };

        const result = buildTikTokVideoInsertData(
          video,
          "user_001",
          "creator_001",
        );

        expect(result.title).toBeNull();
        expect(result.description).toBeNull();
        expect(result.thumbnail_url).toBeNull();
        expect(result.creator_username).toBeNull();
        expect(result.tags).toEqual([]);
      });
    });

    describe("create_time変換", () => {
      it("Unixタイムスタンプ(秒)がISOStringに変換される", () => {
        const result = buildTikTokVideoInsertData(
          baseVideo,
          "user_001",
          "creator_001",
        );

        expect(result.published_at).toBe(
          new Date(1700000000 * 1000).toISOString(),
        );
      });

      it("create_timeが0の場合published_atがnullになる", () => {
        const video: TikTokVideoFromAPI = {
          ...baseVideo,
          create_time: 0,
        };

        const result = buildTikTokVideoInsertData(
          video,
          "user_001",
          "creator_001",
        );

        expect(result.published_at).toBeNull();
      });
    });

    describe("ハッシュタグ抽出", () => {
      it("説明文からハッシュタグが正しく抽出される", () => {
        const video: TikTokVideoFromAPI = {
          ...baseVideo,
          video_description: "#チームみらい #teammirai #政治 普通のテキスト",
        };

        const result = buildTikTokVideoInsertData(
          video,
          "user_001",
          "creator_001",
        );

        expect(result.tags).toEqual(["#チームみらい", "#teammirai", "#政治"]);
      });

      it("ハッシュタグなしの場合空配列になる", () => {
        const video: TikTokVideoFromAPI = {
          ...baseVideo,
          video_description: "ハッシュタグなしのテキスト",
        };

        const result = buildTikTokVideoInsertData(
          video,
          "user_001",
          "creator_001",
        );

        expect(result.tags).toEqual([]);
      });
    });
  });

  describe("buildTikTokVideoUpdateData", () => {
    describe("全フィールドあり", () => {
      it("全フィールドが正しく構築される", () => {
        const result = buildTikTokVideoUpdateData(baseVideo);

        expect(result.title).toBe("テスト動画");
        expect(result.description).toBe("#チームみらい の活動 #政治");
        expect(result.thumbnail_url).toBe("https://example.com/cover.jpg");
        expect(result.duration).toBe(60);
        expect(result.updated_at).toBeDefined();
      });
    });

    describe("optionalフィールドなし", () => {
      it("optionalフィールドがnullになる", () => {
        const video: TikTokVideoFromAPI = {
          id: "video_002",
          create_time: 0,
          share_url: "https://www.tiktok.com/@user/video/video_002",
          duration: 0,
        };

        const result = buildTikTokVideoUpdateData(video);

        expect(result.title).toBeNull();
        expect(result.description).toBeNull();
        expect(result.thumbnail_url).toBeNull();
        expect(result.duration).toBeNull();
      });
    });

    describe("updated_at", () => {
      it("updated_atがISO文字列で設定される", () => {
        const result = buildTikTokVideoUpdateData(baseVideo);

        expect(() => new Date(result.updated_at)).not.toThrow();
        expect(new Date(result.updated_at).toISOString()).toBe(
          result.updated_at,
        );
      });
    });
  });
});
