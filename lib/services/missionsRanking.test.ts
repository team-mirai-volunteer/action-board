import {
  getMissionRanking,
  getTopUsersPostingCount,
  getUserMissionRanking,
  getUserPostingCount,
} from "./missionsRanking";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("missionsRanking service", () => {
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

  describe("getMissionRanking", () => {
    it("ミッションランキングを正常に取得する", async () => {
      const mockRankingData = [
        {
          user_id: "user-1",
          user_name: "ユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          level: 10,
          xp: 1000,
          updated_at: "2023-01-01T00:00:00Z",
          clear_count: 5,
          total_points: 500,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const result = await getMissionRanking("mission-1", 10);

      expect(result).toEqual([
        {
          user_id: "user-1",
          name: "ユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          level: 10,
          xp: 1000,
          updated_at: "2023-01-01T00:00:00Z",
          user_achievement_count: 5,
          total_points: 500,
        },
      ]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_mission_ranking", {
        mission_id: "mission-1",
        limit_count: 10,
      });
    });

    it("デフォルトのlimit値（10）を使用する", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      await getMissionRanking("mission-1");

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_mission_ranking", {
        mission_id: "mission-1",
        limit_count: 10,
      });
    });

    it("データがnullまたは空の場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await getMissionRanking("mission-1");

      expect(result).toEqual([]);
    });

    it("エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "RPC関数エラー" };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      await expect(getMissionRanking("mission-1")).rejects.toThrow(
        "ミッションランキングデータの取得に失敗しました: RPC関数エラー",
      );
    });
  });

  describe("getUserMissionRanking", () => {
    it("特定ユーザーのミッションランキングを正常に取得する", async () => {
      const mockRankingData = [
        {
          user_id: "user-1",
          user_name: "ユーザー1",
          address_prefecture: "東京都",
          rank: 5,
          level: 7,
          xp: 700,
          updated_at: "2023-01-01T00:00:00Z",
          clear_count: 3,
          total_points: 300,
        },
      ];

      const mockRpc = {
        limit: jest
          .fn()
          .mockResolvedValue({ data: mockRankingData, error: null }),
      };
      mockSupabase.rpc.mockReturnValue(mockRpc);

      const result = await getUserMissionRanking("mission-1", "user-1");

      expect(result).toEqual({
        user_id: "user-1",
        name: "ユーザー1",
        address_prefecture: "東京都",
        rank: 5,
        level: 7,
        xp: 700,
        updated_at: "2023-01-01T00:00:00Z",
        user_achievement_count: 3,
        total_points: 300,
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_mission_ranking",
        {
          mission_id: "mission-1",
          user_id: "user-1",
        },
      );
      expect(mockRpc.limit).toHaveBeenCalledWith(1);
    });

    it("データがnullまたは空の場合はnullを返す", async () => {
      const mockRpc = {
        limit: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      mockSupabase.rpc.mockReturnValue(mockRpc);

      const result = await getUserMissionRanking("mission-1", "user-1");

      expect(result).toBeNull();
    });

    it("エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "ユーザーランキング取得エラー" };
      const mockRpc = {
        limit: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };
      mockSupabase.rpc.mockReturnValue(mockRpc);

      await expect(
        getUserMissionRanking("mission-1", "user-1"),
      ).rejects.toThrow(
        "ユーザーのミッションランキングデータの取得に失敗しました: ユーザーランキング取得エラー",
      );
    });
  });

  describe("getUserPostingCount", () => {
    it("ユーザーのポスティング枚数を正常に取得する", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 25, error: null });

      const result = await getUserPostingCount("user-1");

      expect(result).toBe(25);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_posting_count", {
        target_user_id: "user-1",
      });
    });

    it("データがnullの場合は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await getUserPostingCount("user-1");

      expect(result).toBe(0);
    });

    it("データがundefinedの場合は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: undefined, error: null });

      const result = await getUserPostingCount("user-1");

      expect(result).toBe(0);
    });

    it("データが数値でない場合は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: "invalid", error: null });

      const result = await getUserPostingCount("user-1");

      expect(result).toBe(0);
    });

    it("エラーが発生した場合は0を返す", async () => {
      const mockError = {
        message: "RPC関数エラー",
        code: "42P01",
        details: "詳細エラー情報",
      };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      const result = await getUserPostingCount("user-1");

      expect(result).toBe(0);
    });
  });

  describe("getTopUsersPostingCount", () => {
    it("複数ユーザーのポスティング枚数を正常に取得する", async () => {
      const mockData = [
        { user_id: "user-1", posting_count: 25 },
        { user_id: "user-2", posting_count: 15 },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

      const result = await getTopUsersPostingCount(["user-1", "user-2"]);

      expect(result).toEqual(mockData);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_top_users_posting_count",
        {
          user_ids: ["user-1", "user-2"],
        },
      );
    });

    it("データがnullの場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await getTopUsersPostingCount(["user-1"]);

      expect(result).toEqual([]);
    });

    it("データがundefinedの場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: undefined, error: null });

      const result = await getTopUsersPostingCount(["user-1"]);

      expect(result).toEqual([]);
    });

    it("エラーが発生した場合は例外を投げる", async () => {
      const mockError = { message: "RPC関数エラー" };
      mockSupabase.rpc.mockResolvedValue({ data: null, error: mockError });

      await expect(getTopUsersPostingCount(["user-1"])).rejects.toThrow(
        "ユーザーのポスティング枚数取得に失敗しました: RPC関数エラー",
      );
    });
  });
});
