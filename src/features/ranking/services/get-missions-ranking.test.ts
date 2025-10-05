import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import { getJSTMidnightToday } from "@/lib/utils/date-utils";
import {
  getMissionRanking,
  getTopUsersPostingCount,
  getTopUsersPostingCountByMission,
  getUserMissionRanking,
  getUserPostingCount,
  getUserPostingCountByMission,
} from "./get-missions-ranking";

// Supabaseクライアントをモック
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

// seasonsサービスをモック
jest.mock("@/lib/services/seasons", () => ({
  getCurrentSeasonId: jest.fn(),
}));

describe("missionsRanking service", () => {
  const mockSupabase = {
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    (getCurrentSeasonId as jest.Mock).mockResolvedValue("test-season-id");
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
            user_achievement_count: 5,
            rank: 1,
          },
          {
            user_id: "user2",
            user_name: "テストユーザー2",
            address_prefecture: "大阪府",
            level: 8,
            xp: 800,
            updated_at: "2024-01-01T00:00:00Z",
            user_achievement_count: 3,
            rank: 2,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getMissionRanking(missionId);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_period_mission_ranking",
          {
            p_mission_id: missionId,
            p_limit: 10,
            p_start_date: undefined,
            p_season_id: "test-season-id",
          },
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({
          user_id: "user1",
          name: "テストユーザー1",
          user_achievement_count: 5,
        });
      });

      it("limitパラメータで取得件数を制限できる", async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: [],
          error: null,
        });

        await getMissionRanking(missionId, 20);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_period_mission_ranking",
          {
            p_mission_id: missionId,
            p_limit: 20,
            p_start_date: undefined,
            p_season_id: "test-season-id",
          },
        );
      });
    });

    describe("期間別ミッションランキング取得", () => {
      it("日間ランキングを取得する", async () => {
        const mockRankingData = [
          {
            mission_id: missionId,
            user_id: "user1",
            user_name: "テストユーザー1",
            address_prefecture: "東京都",
            user_achievement_count: 2,
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
            p_season_id: "test-season-id",
          },
        );
        expect(result[0]).toMatchObject({
          user_id: "user1",
          name: "テストユーザー1",
          user_achievement_count: 2,
          level: null,
          xp: null,
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
        const todayMidnight = getJSTMidnightToday();
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
            user_achievement_count: 5,
            rank: 3,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getUserMissionRanking(missionId, userId);

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_user_period_mission_ranking",
          {
            p_mission_id: missionId,
            p_user_id: userId,
            p_start_date: undefined,
            p_season_id: "test-season-id",
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
            user_name: "テストユーザー",
            address_prefecture: "東京都",
            user_achievement_count: 2,
            rank: 5,
            level: null,
            xp: null,
            updated_at: null,
          },
        ];

        mockSupabase.rpc.mockResolvedValue({
          data: mockRankingData,
          error: null,
        });

        const result = await getUserMissionRanking(
          missionId,
          userId,
          undefined,
          "daily",
        );

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
          "get_user_period_mission_ranking",
          {
            p_mission_id: missionId,
            p_user_id: userId,
            p_start_date: expect.any(String),
            p_season_id: "test-season-id",
          },
        );
        expect(result).toMatchObject({
          user_id: userId,
          name: "テストユーザー",
          rank: 5,
          level: null,
          xp: null,
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

  describe("getUserPostingCount", () => {
    it("RPCの数値を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 7, error: null });
      const r = await getUserPostingCount("user-1");
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_posting_count", {
        target_user_id: "user-1",
      });
      expect(r).toBe(7);
    });

    it("dataがnullの場合は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      const r = await getUserPostingCount("user-1");
      expect(r).toBe(0);
    });

    it("エラー時は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const r = await getUserPostingCount("user-1");
      expect(r).toBe(0);
    });
  });

  describe("getUserPostingCountByMission", () => {
    it("指定したseasonIdでRPCを呼び出し、数値を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 3, error: null });
      const r = await getUserPostingCountByMission(
        "user-1",
        "mission-1",
        "season-X",
      );
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_posting_count_by_mission",
        {
          target_user_id: "user-1",
          target_mission_id: "mission-1",
          p_season_id: "season-X",
        },
      );
      expect(r).toBe(3);
    });

    it("seasonId未指定で現在のシーズンを使用する", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 2, error: null });
      const r = await getUserPostingCountByMission("user-1", "mission-1");
      expect(getCurrentSeasonId).toHaveBeenCalled();
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_posting_count_by_mission",
        {
          target_user_id: "user-1",
          target_mission_id: "mission-1",
          p_season_id: "test-season-id",
        },
      );
      expect(r).toBe(2);
    });

    it("dataがnullの場合は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      const r = await getUserPostingCountByMission(
        "user-1",
        "mission-1",
        "season-X",
      );
      expect(r).toBe(0);
    });

    it("エラー時は0を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      const r = await getUserPostingCountByMission(
        "user-1",
        "mission-1",
        "season-X",
      );
      expect(r).toBe(0);
    });
  });

  describe("getTopUsersPostingCount", () => {
    it("配列データをそのまま返す", async () => {
      const data = [{ user_id: "u1", posting_count: 5 }];
      mockSupabase.rpc.mockResolvedValue({ data, error: null });
      const r = await getTopUsersPostingCount(["u1"]);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_top_users_posting_count",
        { user_ids: ["u1"] },
      );
      expect(r).toEqual(data);
    });

    it("dataがnullの場合は[]を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      const r = await getTopUsersPostingCount(["u1"]);
      expect(r).toEqual([]);
    });

    it("エラー時は例外を投げる", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      await expect(getTopUsersPostingCount(["u1"])).rejects.toThrow(
        "ユーザーのポスティング枚数取得に失敗しました",
      );
    });
  });

  describe("getTopUsersPostingCountByMission", () => {
    it("指定したseasonIdで配列データを返す", async () => {
      const data = [{ user_id: "u1", posting_count: 9 }];
      mockSupabase.rpc.mockResolvedValue({ data, error: null });
      const r = await getTopUsersPostingCountByMission(
        ["u1"],
        "mission-1",
        "season-X",
      );
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_top_users_posting_count_by_mission",
        {
          user_ids: ["u1"],
          target_mission_id: "mission-1",
          p_season_id: "season-X",
        },
      );
      expect(r).toEqual(data);
    });

    it("seasonId未指定で現在のシーズンを使用する", async () => {
      (getCurrentSeasonId as jest.Mock).mockResolvedValueOnce("season-1");
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });
      await getTopUsersPostingCountByMission(["u1"], "mission-1");
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_top_users_posting_count_by_mission",
        {
          user_ids: ["u1"],
          target_mission_id: "mission-1",
          p_season_id: "season-1",
        },
      );
    });

    it("dataがnullの場合は[]を返す", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });
      const r = await getTopUsersPostingCountByMission(
        ["u1"],
        "mission-1",
        "season-X",
      );
      expect(r).toEqual([]);
    });

    it("エラー時は例外を投げる", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "DB error" },
      });
      await expect(
        getTopUsersPostingCountByMission(["u1"], "mission-1", "season-X"),
      ).rejects.toThrow(
        "ミッション別ユーザーのポスティング枚数取得に失敗しました",
      );
    });
  });
});
