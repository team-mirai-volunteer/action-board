import { getRanking } from "./ranking";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("ranking service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getRanking", () => {
    it("ランキングデータを正常に取得する", async () => {
      const mockRankingData = [
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
          address_prefecture: "大阪府",
          rank: 2,
          level: 8,
          xp: 800,
          updated_at: "2023-01-01T00:00:00Z",
        },
      ];

      mockSupabase.limit.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const result = await getRanking(10);

      expect(result).toEqual(mockRankingData);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_ranking_view");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
    });

    it("デフォルトのlimit値（10）を使用する", async () => {
      mockSupabase.limit.mockResolvedValue({ data: [], error: null });

      await getRanking();

      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
    });

    it("データがnullの場合は空配列を返す", async () => {
      mockSupabase.limit.mockResolvedValue({ data: null, error: null });

      const result = await getRanking();

      expect(result).toEqual([]);
    });

    it("エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "データベースエラー" };
      mockSupabase.limit.mockResolvedValue({ data: null, error: mockError });

      await expect(getRanking()).rejects.toThrow(
        "ランキングデータの取得に失敗しました: データベースエラー",
      );
    });

    it("予期しないエラーが発生した場合は例外を再投げする", async () => {
      mockSupabase.limit.mockRejectedValue(new Error("予期しないエラー"));

      await expect(getRanking()).rejects.toThrow("予期しないエラー");
    });

    it("カスタムlimit値を使用する", async () => {
      mockSupabase.limit.mockResolvedValue({ data: [], error: null });

      await getRanking(20);

      expect(mockSupabase.limit).toHaveBeenCalledWith(20);
    });
  });
});
