import { createClient } from "@/lib/supabase/server";
import { getRanking } from "./ranking";

// Supabaseクライアントをモック
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("ranking service", () => {
  const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
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

        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: mockRankingData,
              error: null,
            }),
          }),
        });

        const result = await getRanking();

        expect(mockSupabase.from).toHaveBeenCalledWith("user_ranking_view");
        expect(result).toEqual(mockRankingData);
      });

      it("limitパラメータで取得件数を制限できる", async () => {
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        });

        await getRanking(20);

        const limitCall = mockSupabase.from().select().limit;
        expect(limitCall).toHaveBeenCalledWith(20);
      });

      it("エラー時は例外をスローする", async () => {
        const mockError = { message: "Database error" };
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        });

        await expect(getRanking()).rejects.toThrow(
          "ランキングデータの取得に失敗しました: Database error",
        );
      });
    });

    describe("期間別ランキング取得", () => {
      it("日間ランキングを取得する", async () => {
        const mockXpData = [
          { user_id: "user1", xp_amount: 100 },
          { user_id: "user1", xp_amount: 50 },
          { user_id: "user2", xp_amount: 200 },
        ];

        const mockUserData = [
          { id: "user1", name: "ユーザー1", address_prefecture: "東京都" },
          { id: "user2", name: "ユーザー2", address_prefecture: "大阪府" },
        ];

        const mockLevelData = [
          { user_id: "user1", level: 5, xp: 500 },
          { user_id: "user2", level: 3, xp: 300 },
        ];

        // xp_transactionsのモック
        mockSupabase.from.mockImplementation((table) => {
          if (table === "xp_transactions") {
            return {
              select: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  not: jest.fn().mockResolvedValue({
                    data: mockXpData,
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "public_user_profiles") {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockUserData,
                  error: null,
                }),
              }),
            };
          }
          if (table === "user_levels") {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockLevelData,
                  error: null,
                }),
              }),
            };
          }
        });

        const result = await getRanking(10, "daily");

        expect(mockSupabase.from).toHaveBeenCalledWith("xp_transactions");
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
      });

      it("週間ランキングを取得する", async () => {
        const mockXpData = [{ user_id: "user1", xp_amount: 300 }];
        const mockUserData = [
          { id: "user1", name: "ユーザー1", address_prefecture: "東京都" },
        ];
        const mockLevelData = [{ user_id: "user1", level: 5, xp: 500 }];

        mockSupabase.from.mockImplementation((table) => {
          if (table === "xp_transactions") {
            return {
              select: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  not: jest.fn().mockResolvedValue({
                    data: mockXpData,
                    error: null,
                  }),
                }),
              }),
            };
          }
          if (table === "public_user_profiles") {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockUserData,
                  error: null,
                }),
              }),
            };
          }
          if (table === "user_levels") {
            return {
              select: jest.fn().mockReturnValue({
                in: jest.fn().mockResolvedValue({
                  data: mockLevelData,
                  error: null,
                }),
              }),
            };
          }
        });

        const result = await getRanking(10, "weekly");

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          user_id: "user1",
          xp: 300,
          rank: 1,
        });
      });

      it("期間内にXPを獲得したユーザーがいない場合は空配列を返す", async () => {
        mockSupabase.from.mockImplementation((table) => {
          if (table === "xp_transactions") {
            return {
              select: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  not: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            };
          }
        });

        const result = await getRanking(10, "daily");

        expect(result).toEqual([]);
      });

      it("XP取得エラー時は例外をスローする", async () => {
        mockSupabase.from.mockImplementation((table) => {
          if (table === "xp_transactions") {
            return {
              select: jest.fn().mockReturnValue({
                gte: jest.fn().mockReturnValue({
                  not: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: "XP fetch error" },
                  }),
                }),
              }),
            };
          }
        });

        await expect(getRanking(10, "daily")).rejects.toThrow(
          "XPトランザクションの取得に失敗しました: XP fetch error",
        );
      });
    });
  });
});
