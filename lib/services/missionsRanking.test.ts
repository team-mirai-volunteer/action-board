import { createClient } from "@/lib/supabase/server";
import { getMissionRanking, getUserMissionRanking } from "./missionsRanking";

// Supabaseクライアントをモック
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("missionsRanking service", () => {
  const mockSupabase = {
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("getMissionRanking", () => {
    const missionId = "mission-123";

    describe("全期間のミッションランキング取得", () => {
      it("デフォルトで全期間のランキングを取得する", async () => {
        const mockRankingData = [
          {
            user_id: "user1",
            user_name: "テストユーザー1",
            address_prefecture: "東京都",
            level: 10,
            xp: 1000,
            updated_at: "2024-01-01T00:00:00Z",
            clear_count: 5,
            total_points: 500,
            rank: 1,
          },
          {
            user_id: "user2",
            user_name: "テストユーザー2",
            address_prefecture: "大阪府",
            level: 8,
            xp: 800,
            updated_at: "2024-01-01T00:00:00Z",
            clear_count: 3,
            total_points: 300,
            rank: 2,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getMissionRanking(missionId);

        expect(mockSupabase.rpc).toHaveBeenCalledWith("get_mission_ranking", {
          mission_id: missionId,
          limit_count: 10,
        });
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          user_id: "user1",
          name: "テストユーザー1",
          user_achievement_count: 5,
          total_points: 500,
        });
      });

      it("limitパラメータで取得件数を制限できる", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getMissionRanking(missionId, 20);

        expect(mockSupabase.rpc).toHaveBeenCalledWith("get_mission_ranking", {
          mission_id: missionId,
          limit_count: 20,
        });
      });
    });

    describe("期間別ミッションランキング取得", () => {
      it("日間ランキングを取得する", async () => {
        const mockRankingData = [
          {
            mission_id: missionId,
            user_id: "user1",
            name: "テストユーザー1",
            address_prefecture: "東京都",
            user_achievement_count: 2,
            total_points: 100,
            rank: 1,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getMissionRanking(missionId, 10, "daily");

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_period_mission_ranking",
          {
            p_mission_id: missionId,
            p_limit: 10,
            p_start_date: expect.any(String),
          },
        );
        expect(result[0]).toMatchObject({
          user_id: "user1",
          name: "テストユーザー1",
          user_achievement_count: 2,
          level: null,
          xp: null,
          total_points: 100,
        });
      });

      it("日次ランキングを取得する（日付確認）", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getMissionRanking(missionId, 10, "daily");

        const rpcCall = mockSupabase.rpc.mock.calls[0];
        expect(rpcCall[0]).toBe("get_period_mission_ranking");
        expect(rpcCall[1]).toHaveProperty("p_start_date");
        expect(rpcCall[1].p_start_date).toBeTruthy();

        const startDate = new Date(rpcCall[1].p_start_date);
        const now = new Date();
        const todayMidnight = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          0,
          0,
          0,
        );
        expect(startDate.getTime()).toBe(todayMidnight.getTime());
      });
    });

    it("エラー時は例外をスローする", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(getMissionRanking(missionId)).rejects.toThrow(
        "ミッションランキングデータの取得に失敗しました: Database error",
      );
    });

    it("データがない場合は空配列を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getMissionRanking(missionId);
      expect(result).toEqual([]);
    });
  });

  describe("getUserMissionRanking", () => {
    const missionId = "mission-123";
    const userId = "user-456";

    describe("全期間のユーザーミッションランキング取得", () => {
      it("特定ユーザーのランキング情報を取得する", async () => {
        const mockRankingData = [
          {
            user_id: userId,
            user_name: "テストユーザー",
            address_prefecture: "東京都",
            level: 10,
            xp: 1000,
            updated_at: "2024-01-01T00:00:00Z",
            clear_count: 5,
            total_points: 500,
            rank: 3,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getUserMissionRanking(missionId, userId);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_user_mission_ranking",
          {
            mission_id: missionId,
            user_id: userId,
          },
        );
        expect(result).toMatchObject({
          user_id: userId,
          name: "テストユーザー",
          user_achievement_count: 5,
          rank: 3,
        });
      });
    });

    describe("期間別ユーザーミッションランキング取得", () => {
      it("日間のユーザーランキングを取得する", async () => {
        const mockRankingData = [
          {
            mission_id: missionId,
            user_id: userId,
            name: "テストユーザー",
            address_prefecture: "東京都",
            user_achievement_count: 2,
            total_points: 50,
            rank: 5,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getUserMissionRanking(missionId, userId, "daily");

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_user_period_mission_ranking",
          {
            p_mission_id: missionId,
            p_user_id: userId,
            p_start_date: expect.any(String),
          },
        );
        expect(result).toMatchObject({
          user_id: userId,
          name: "テストユーザー",
          rank: 5,
          level: null,
          xp: null,
          total_points: 50,
        });
      });
    });

    it("ユーザーがランキングに存在しない場合はnullを返す", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getUserMissionRanking(missionId, userId);
      expect(result).toBeNull();
    });

    it("エラー時は例外をスローする", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(getUserMissionRanking(missionId, userId)).rejects.toThrow(
        "ユーザーのミッションランキングデータの取得に失敗しました: Database error",
      );
    });
  });
});
