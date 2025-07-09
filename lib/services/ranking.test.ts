import { createClient } from "@/lib/supabase/server";
import { getRanking } from "./ranking";

jest.mock("@/lib/dateUtils", () => ({
  getJSTMidnightToday: jest.fn(() => new Date("2024-01-01T15:00:00.000Z")), // UTC 15:00 = JST 00:00
}));

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
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
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
          error: { message: "RPC fetch error" },
        });

        await expect(getRanking(10, "daily")).rejects.toThrow(
          "期間別ランキングの取得に失敗しました: RPC fetch error",
        );
      });
    });

    describe("JST境界での集計精度テスト", () => {
      it("should use consistent JST midnight across multiple calls", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getRanking(10, "daily");
        await getRanking(20, "daily");

        const rpcCalls = mockSupabase.rpc.mock.calls.filter(
          (call) => call[0] === "get_period_ranking",
        );

        expect(rpcCalls.length).toBe(2);

        const firstCallDate = new Date(rpcCalls[0][1].p_start_date);
        const secondCallDate = new Date(rpcCalls[1][1].p_start_date);

        expect(firstCallDate.getTime()).toBe(secondCallDate.getTime());
        expect(firstCallDate.getTime()).toBe(
          new Date("2024-01-01T15:00:00.000Z").getTime(),
        );
      });

      it("should handle JST boundary correctly for aggregation", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getRanking(10, "daily");

        const rpcCall = mockSupabase.rpc.mock.calls.find(
          (call) => call[0] === "get_period_ranking",
        );

        const startDate = new Date(rpcCall[1].p_start_date);

        expect(startDate.getUTCHours()).toBe(15);
        expect(startDate.getUTCMinutes()).toBe(0);
        expect(startDate.getUTCSeconds()).toBe(0);
        expect(startDate.getUTCMilliseconds()).toBe(0);
      });

      it("should ensure aggregation boundary consistency", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getRanking(5, "daily");

        const rpcCall = mockSupabase.rpc.mock.calls.find(
          (call) => call[0] === "get_period_ranking",
        );

        expect(rpcCall[1]).toEqual({
          p_start_date: "2024-01-01T15:00:00.000Z",
          p_limit: 5,
        });
      });
    });
  });
});
