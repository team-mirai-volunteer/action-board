import { getPartyMembershipMap } from "@/features/party-membership/services/memberships";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { getRanking } from "./get-ranking";

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
}));

describe("ranking service", () => {
  const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createAdminClient as jest.Mock).mockResolvedValue(mockSupabase);
    (getCurrentSeasonId as jest.Mock).mockResolvedValue("test-season-id");
    (getPartyMembershipMap as jest.Mock).mockResolvedValue({});
  });

  describe("getRanking", () => {
    describe("全期間のランキング取得", () => {
      it("デフォルトで全期間のランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: "user1",
            name: "テストユーザー1",
            address_prefecture: "東京都",
            rank: 1,
            level: 10,
            xp: 1000,
            updated_at: "2024-01-01T00:00:00Z",
          },
          {
            user_id: "user2",
            name: "テストユーザー2",
            address_prefecture: "大阪府",
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
        (getPartyMembershipMap as jest.Mock).mockResolvedValue({
          user1: {
            user_id: "user1",
            plan: "regular",
            badge_visibility: false,
            synced_at: "2024-01-01T00:00:00Z",
            metadata: {},
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        });

        const result = await getRanking();

        expect(mockSupabase.rpc).toHaveBeenCalledWith("get_period_ranking", {
          p_start_date: undefined,
          p_limit: 10,
          p_end_date: undefined,
          p_season_id: "test-season-id",
        });
        expect(result).toEqual([
          {
            ...mockRankingData[0],
            party_membership: {
              user_id: "user1",
              plan: "regular",
              badge_visibility: false,
              synced_at: "2024-01-01T00:00:00Z",
              metadata: {},
              created_at: "2024-01-01T00:00:00Z",
              updated_at: "2024-01-01T00:00:00Z",
            },
          },
          {
            ...mockRankingData[1],
            party_membership: null,
          },
        ]);
        expect(getPartyMembershipMap).toHaveBeenCalledWith(["user1", "user2"]);
      });

      it("limitパラメータで取得件数を制限できる", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getRanking(20);

        expect(mockSupabase.rpc).toHaveBeenCalledWith("get_period_ranking", {
          p_start_date: undefined,
          p_limit: 20,
          p_end_date: undefined,
          p_season_id: "test-season-id",
        });
      });

      it("エラー時は例外をスローする", async () => {
        const mockError = { message: "Test Database error" };
        mockSupabase.rpc.mockResolvedValue({
          data: null,
          error: mockError,
        });

        await expect(getRanking()).rejects.toThrow(
          "シーズンランキングの取得に失敗しました: Test Database error",
        );
      });
    });

    describe("期間別ランキング取得", () => {
      it("日間ランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: "user2",
            name: "ユーザー2",
            address_prefecture: "大阪府",
            rank: 1,
            level: 3,
            xp: 200,
            updated_at: null,
          },
          {
            user_id: "user1",
            name: "ユーザー1",
            address_prefecture: "東京都",
            rank: 2,
            level: 5,
            xp: 150,
            updated_at: null,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getRanking(10, "daily");

        expect(mockSupabase.rpc).toHaveBeenCalledWith("get_period_ranking", {
          p_start_date: expect.any(String),
          p_limit: 10,
          p_end_date: undefined,
          p_season_id: "test-season-id",
        });
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          user_id: "user2",
          name: "ユーザー2",
          xp: 200,
          rank: 1,
        });
        expect(result[1]).toMatchObject({
          user_id: "user1",
          name: "ユーザー1",
          xp: 150,
          rank: 2,
        });
        expect(getPartyMembershipMap).toHaveBeenCalledWith(["user2", "user1"]);
      });

      it("日次ランキングを取得する（複数日のデータ）", async () => {
        const mockRankingData = [
          {
            user_id: "user1",
            name: "ユーザー1",
            address_prefecture: "東京都",
            rank: 1,
            level: 5,
            xp: 300,
            updated_at: null,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getRanking(10, "daily");

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          user_id: "user1",
          xp: 300,
          rank: 1,
        });
        expect(getPartyMembershipMap).toHaveBeenCalledWith(["user1"]);
      });

      it("期間内にXPを獲得したユーザーがいない場合は空配列を返す", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        const result = await getRanking(10, "daily");

        expect(result).toEqual([]);
      });

      it("RPC取得エラー時は例外をスローする", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: null,
          error: { message: "Test RPC fetch error" },
        });

        await expect(getRanking(10, "daily")).rejects.toThrow(
          "シーズンランキングの取得に失敗しました: Test RPC fetch error",
        );
      });
    });
  });
});
