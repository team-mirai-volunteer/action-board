import type { UserBadge } from "./badge-types";
import {
  getBadgeEmoji,
  getBadgeRankingUrl,
  getBadgeTitle,
} from "./badge-types";

const createBadge = (overrides: Partial<UserBadge> = {}): UserBadge => ({
  id: "badge-1",
  user_id: "user-1",
  badge_type: "ALL",
  sub_type: null,
  rank: 1,
  season_id: "season-1",
  achieved_at: "2025-01-01T00:00:00Z",
  is_notified: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
});

describe("badge-types", () => {
  describe("getBadgeTitle", () => {
    describe("badge_typeごとのタイトル生成", () => {
      it("DAILY: デイリーランキング + 順位を返す", () => {
        const badge = createBadge({ badge_type: "DAILY", rank: 5 });
        expect(getBadgeTitle(badge)).toBe("デイリーランキング 5位");
      });

      it("ALL: 総合ランキング + 順位を返す", () => {
        const badge = createBadge({ badge_type: "ALL", rank: 1 });
        expect(getBadgeTitle(badge)).toBe("総合ランキング 1位");
      });

      it("PREFECTURE: sub_type(都道府県名)ランキング + 順位を返す", () => {
        const badge = createBadge({
          badge_type: "PREFECTURE",
          sub_type: "東京都",
          rank: 3,
        });
        expect(getBadgeTitle(badge)).toBe("東京都ランキング 3位");
      });

      it("MISSION: mission_titleがある場合はそれを使う", () => {
        const badge = createBadge({
          badge_type: "MISSION",
          sub_type: "mission-slug",
          mission_title: "SNS投稿ミッション",
          rank: 2,
        });
        expect(getBadgeTitle(badge)).toBe("SNS投稿ミッション 2位");
      });

      it("MISSION: mission_titleがない場合はsub_typeを使う", () => {
        const badge = createBadge({
          badge_type: "MISSION",
          sub_type: "mission-slug",
          rank: 10,
        });
        expect(getBadgeTitle(badge)).toBe("mission-slug 10位");
      });

      it("MISSION: mission_titleもsub_typeもない場合", () => {
        const badge = createBadge({
          badge_type: "MISSION",
          sub_type: null,
          rank: 1,
        });
        expect(getBadgeTitle(badge)).toBe("ミッションランキング 1位");
      });
    });

    describe("rank値のバリエーション", () => {
      it("rank=1の場合", () => {
        const badge = createBadge({ badge_type: "ALL", rank: 1 });
        expect(getBadgeTitle(badge)).toBe("総合ランキング 1位");
      });

      it("rank=100の場合", () => {
        const badge = createBadge({ badge_type: "ALL", rank: 100 });
        expect(getBadgeTitle(badge)).toBe("総合ランキング 100位");
      });
    });
  });

  describe("getBadgeEmoji", () => {
    it("rank 1-10 は金メダル絵文字を返す", () => {
      expect(getBadgeEmoji(1)).toBe("\u{1F947}");
      expect(getBadgeEmoji(10)).toBe("\u{1F947}");
    });

    it("rank 11-50 は銀メダル絵文字を返す", () => {
      expect(getBadgeEmoji(11)).toBe("\u{1F948}");
      expect(getBadgeEmoji(50)).toBe("\u{1F948}");
    });

    it("rank 51以上 は銅メダル絵文字を返す", () => {
      expect(getBadgeEmoji(51)).toBe("\u{1F949}");
      expect(getBadgeEmoji(100)).toBe("\u{1F949}");
    });

    it("rank=0 は金メダル絵文字を返す(10以下)", () => {
      expect(getBadgeEmoji(0)).toBe("\u{1F947}");
    });
  });

  describe("getBadgeRankingUrl", () => {
    describe("badge_typeごとのURL生成", () => {
      it("DAILY: /ranking?period=daily を返す", () => {
        const badge = createBadge({ badge_type: "DAILY" });
        expect(getBadgeRankingUrl(badge)).toBe("/ranking?period=daily");
      });

      it("ALL: /ranking?period=all を返す", () => {
        const badge = createBadge({ badge_type: "ALL" });
        expect(getBadgeRankingUrl(badge)).toBe("/ranking?period=all");
      });

      it("PREFECTURE: sub_typeがある場合はURLエンコードされた都道府県名を含む", () => {
        const badge = createBadge({
          badge_type: "PREFECTURE",
          sub_type: "東京都",
        });
        expect(getBadgeRankingUrl(badge)).toBe(
          `/ranking/ranking-prefecture?prefecture=${encodeURIComponent("東京都")}`,
        );
      });

      it("PREFECTURE: sub_typeがnullの場合は汎用URLを返す", () => {
        const badge = createBadge({
          badge_type: "PREFECTURE",
          sub_type: null,
        });
        expect(getBadgeRankingUrl(badge)).toBe("/ranking/ranking-prefecture");
      });

      it("MISSION: mission_idがある場合はそのIDを含むURLを返す", () => {
        const badge = createBadge({
          badge_type: "MISSION",
          mission_id: "mission-123",
        });
        expect(getBadgeRankingUrl(badge)).toBe(
          "/ranking/ranking-mission?missionId=mission-123",
        );
      });

      it("MISSION: mission_idがない場合は汎用ミッションURLを返す", () => {
        const badge = createBadge({ badge_type: "MISSION" });
        expect(getBadgeRankingUrl(badge)).toBe("/ranking/ranking-mission");
      });
    });

    describe("不明なbadge_type", () => {
      it("未知のbadge_typeの場合はnullを返す", () => {
        const badge = createBadge({
          badge_type: "UNKNOWN" as UserBadge["badge_type"],
        });
        expect(getBadgeRankingUrl(badge)).toBeNull();
      });
    });
  });
});
