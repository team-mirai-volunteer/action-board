import {
  getPartyMembership,
  getPartyMembershipMap,
} from "@/features/party-membership/services/memberships";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { getJSTMidnightToday } from "@/lib/utils/date-utils";

// Mock dateUtils
jest.mock("@/lib/utils/date-utils", () => ({
  getJSTMidnightToday: jest.fn(() => new Date("2024-01-01T00:00:00Z")),
}));

import { getCurrentSeasonId } from "@/lib/services/seasons";
import {
  getPrefecturesRanking,
  getUserPrefecturesRanking,
} from "./get-prefectures-ranking";

// Supabaseクライアントをモック
jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

// seasonsサービスをモック
jest.mock("@/lib/services/seasons", () => ({
  getCurrentSeasonId: jest.fn(),
}));

jest.mock("@/features/party-membership/services/memberships", () => ({
  getPartyMembershipMap: jest.fn(),
  getPartyMembership: jest.fn(),
}));

describe("prefecturesRanking service", () => {
  const mockSupabase = {
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createAdminClient as jest.Mock).mockResolvedValue(mockSupabase);
    (getCurrentSeasonId as jest.Mock).mockResolvedValue("test-season-id");
    (getPartyMembershipMap as jest.Mock).mockResolvedValue({});
    (getPartyMembership as jest.Mock).mockResolvedValue(null);
  });

  describe("getPrefecturesRanking", () => {
    const prefecture = "東京都";

    describe("全期間の都道府県別ランキング取得", () => {
      it("デフォルトで全期間のランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: "user1",
            name: "東京ユーザー1",
            address_prefecture: "東京都",
            rank: 1,
            level: 10,
            xp: 1000,
            updated_at: "2024-01-01T00:00:00Z",
          },
          {
            user_id: "user2",
            name: "東京ユーザー2",
            address_prefecture: "東京都",
            rank: 2,
            level: 8,
            xp: 800,
            updated_at: "2024-01-01T00:00:00Z",
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });
        const result = await getPrefecturesRanking(prefecture);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_period_prefecture_ranking",
          {
            p_prefecture: prefecture,
            p_limit: 10,
            p_start_date: undefined,
            p_season_id: "test-season-id",
          },
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          user_id: "user1",
          name: "東京ユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          party_membership: null,
        });
        expect(getPartyMembershipMap).toHaveBeenCalledWith(["user1", "user2"]);
      });

      it("limitパラメータで取得件数を制限できる", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getPrefecturesRanking(prefecture, 50);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_period_prefecture_ranking",
          {
            p_prefecture: prefecture,
            p_limit: 50,
            p_start_date: undefined,
            p_season_id: "test-season-id",
          },
        );
      });
    });

    describe("期間別都道府県ランキング取得", () => {
      it("日間ランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: "user1",
            name: "東京ユーザー1",
            rank: 1,
            xp: 200,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getPrefecturesRanking(prefecture, 10, "daily");

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_period_prefecture_ranking",
          {
            p_prefecture: prefecture,
            p_limit: 10,
            p_start_date: expect.any(String),
            p_season_id: "test-season-id",
          },
        );
        expect(result[0]).toMatchObject({
          user_id: "user1",
          name: "東京ユーザー1",
          address_prefecture: "東京都", // 引数から設定される
          rank: 1,
          xp: 200,
          level: undefined,
          updated_at: undefined,
          party_membership: null,
        });
        expect(getPartyMembershipMap).toHaveBeenCalledWith(["user1"]);
      });

      it("日次ランキングを取得する（日付確認）", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getPrefecturesRanking(prefecture, 10, "daily");

        const rpcCall = mockSupabase.rpc.mock.calls[0];
        expect(rpcCall[0]).toBe("get_period_prefecture_ranking");

        const startDate = new Date(rpcCall[1].p_start_date);
        const todayMidnight = getJSTMidnightToday();
        expect(startDate.getTime()).toBe(todayMidnight.getTime());
      });
    });

    it("エラー時は例外をスローする", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(getPrefecturesRanking(prefecture)).rejects.toThrow(
        "都道府県ランキングデータの取得に失敗しました: Database error",
      );
    });

    it("データがない場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getPrefecturesRanking(prefecture);
      expect(result).toEqual([]);
    });
  });

  describe("getUserPrefecturesRanking", () => {
    const prefecture = "東京都";
    const userId = "user-123";

    describe("全期間のユーザー都道府県ランキング取得", () => {
      it("特定ユーザーのランキング情報を取得する", async () => {
        const mockRankingData = {
          user_id: userId,
          name: "テストユーザー",
          address_prefecture: "東京都",
          rank: 5,
          level: 7,
          xp: 700,
          updated_at: "2024-01-01T00:00:00Z",
        };

        mockSupabase.rpc.mockResolvedValue({
          data: [mockRankingData],
          error: null,
        });
        (getPartyMembership as jest.Mock).mockResolvedValue({
          user_id: userId,
          plan: "premium",
          badge_visibility: true,
          synced_at: "2024-01-01T00:00:00Z",
          metadata: {},
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        });

        const result = await getUserPrefecturesRanking(prefecture, userId);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_user_period_prefecture_ranking",
          {
            p_prefecture: prefecture,
            p_user_id: userId,
            p_start_date: undefined,
            p_season_id: "test-season-id",
          },
        );
        expect(result).toMatchObject({
          user_id: userId,
          name: "テストユーザー",
          address_prefecture: "東京都",
          rank: 5,
          party_membership: {
            user_id: userId,
            plan: "premium",
          },
        });
        expect(getPartyMembership).toHaveBeenCalledWith(userId);
      });
    });

    describe("期間別ユーザー都道府県ランキング取得", () => {
      it("日間のユーザーランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: userId,
            name: "テストユーザー",
            rank: 3,
            xp: 150,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getUserPrefecturesRanking(
          prefecture,
          userId,
          undefined,
          "daily",
        );

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_user_period_prefecture_ranking",
          {
            p_prefecture: prefecture,
            p_user_id: userId,
            p_start_date: expect.any(String),
            p_season_id: "test-season-id",
          },
        );
        expect(result).toMatchObject({
          user_id: userId,
          name: "テストユーザー",
          address_prefecture: undefined,
          rank: 3,
          xp: 150,
          level: undefined,
        });
      });

      it("週間のユーザーランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: userId,
            name: "テストユーザー",
            rank: 10,
            xp: 500,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getUserPrefecturesRanking(
          prefecture,
          userId,
          undefined,
          "daily",
        );

        expect(result).toMatchObject({
          user_id: userId,
          rank: 10,
          xp: 500,
        });
      });
    });

    it("ユーザーがランキングに存在しない場合はnullを返す", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getUserPrefecturesRanking(prefecture, userId);
      expect(result).toBeNull();
    });

    it("エラー時は例外をスローする", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        getUserPrefecturesRanking(prefecture, userId),
      ).rejects.toThrow(
        "ユーザーの都道府県ランキングデータの取得に失敗しました: Database error",
      );
    });
  });
});
