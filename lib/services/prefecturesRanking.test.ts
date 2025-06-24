import {
  getPrefecturesRanking,
  getUserPrefecturesRanking,
} from "./prefecturesRanking";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("prefecturesRanking service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      rpc: jest.fn(),
    };
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPrefecturesRanking", () => {
    it("都道府県別ランキングを正常に取得する", async () => {
      const mockRankingData = [
        {
          user_id: "user-1",
          user_name: "ユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          level: 10,
          xp: 1000,
          updated_at: "2023-01-01T00:00:00Z",
        },
        {
          user_id: "user-2",
          user_name: "ユーザー2",
          address_prefecture: "東京都",
          rank: 2,
          level: 8,
          xp: 800,
          updated_at: "2023-01-01T00:00:00Z",
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const result = await getPrefecturesRanking("東京都", 10);

      expect(result).toEqual([
        {
          user_id: "user-1",
          name: "ユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          level: 10,
          xp: 1000,
          updated_at: "2023-01-01T00:00:00Z",
        },
        {
          user_id: "user-2",
          name: "ユーザー2",
          address_prefecture: "東京都",
          rank: 2,
          level: 8,
          xp: 800,
          updated_at: "2023-01-01T00:00:00Z",
        },
      ]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_prefecture_ranking", {
        prefecture: "東京都",
        limit_count: 10,
      });
    });

    it("デフォルトのlimit値（10）を使用する", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      await getPrefecturesRanking("東京都");

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_prefecture_ranking", {
        prefecture: "東京都",
        limit_count: 10,
      });
    });

    it("データがnullの場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await getPrefecturesRanking("東京都");

      expect(result).toEqual([]);
    });

    it("データが空配列の場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const result = await getPrefecturesRanking("東京都");

      expect(result).toEqual([]);
    });

    it("エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "RPC関数エラー" };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      await expect(getPrefecturesRanking("東京都")).rejects.toThrow(
        "都道府県ランキングデータの取得に失敗しました: RPC関数エラー",
      );
    });

    it("予期しないエラーが発生した場合は例外を再投げする", async () => {
      mockSupabase.rpc.mockRejectedValue(new Error("予期しないエラー"));

      await expect(getPrefecturesRanking("東京都")).rejects.toThrow(
        "予期しないエラー",
      );
    });
  });

  describe("getUserPrefecturesRanking", () => {
    it("特定ユーザーの都道府県別ランキングを正常に取得する", async () => {
      const mockRankingData = [
        {
          user_id: "user-1",
          user_name: "ユーザー1",
          address_prefecture: "東京都",
          rank: 5,
          level: 7,
          xp: 700,
          updated_at: "2023-01-01T00:00:00Z",
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const result = await getUserPrefecturesRanking("東京都", "user-1");

      expect(result).toEqual({
        user_id: "user-1",
        name: "ユーザー1",
        address_prefecture: "東京都",
        rank: 5,
        level: 7,
        xp: 700,
        updated_at: "2023-01-01T00:00:00Z",
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_prefecture_ranking",
        {
          prefecture: "東京都",
          target_user_id: "user-1",
        },
      );
    });

    it("データがnullの場合はnullを返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await getUserPrefecturesRanking("東京都", "user-1");

      expect(result).toBeNull();
    });

    it("データが空配列の場合はnullを返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const result = await getUserPrefecturesRanking("東京都", "user-1");

      expect(result).toBeNull();
    });

    it("エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "ユーザーランキング取得エラー" };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      await expect(
        getUserPrefecturesRanking("東京都", "user-1"),
      ).rejects.toThrow(
        "ユーザーの都道府県ランキングデータの取得に失敗しました: ユーザーランキング取得エラー",
      );
    });

    it("予期しないエラーが発生した場合は例外を再投げする", async () => {
      mockSupabase.rpc.mockRejectedValue(new Error("予期しないエラー"));

      await expect(
        getUserPrefecturesRanking("東京都", "user-1"),
      ).rejects.toThrow("予期しないエラー");
    });
  });
});
