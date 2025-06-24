import { getUserRepeatableMissionAchievements } from "./userMissionAchievement";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const { createClient: createServerClient } = require("@/lib/supabase/server");
const mockCreateServerClient = createServerClient as jest.MockedFunction<
  typeof createServerClient
>;

describe("userMissionAchievement service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
    };
    mockCreateServerClient.mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserRepeatableMissionAchievements", () => {
    it("リピート可能ミッションの達成状況を正常に取得する", async () => {
      const mockAchievementData = [
        {
          mission_id: "mission-1",
          missions: {
            id: "mission-1",
            title: "ミッション1",
            max_achievement_count: null,
          },
        },
        {
          mission_id: "mission-1",
          missions: {
            id: "mission-1",
            title: "ミッション1",
            max_achievement_count: null,
          },
        },
        {
          mission_id: "mission-2",
          missions: {
            id: "mission-2",
            title: "ミッション2",
            max_achievement_count: null,
          },
        },
      ];

      mockSupabase.is.mockResolvedValue({
        data: mockAchievementData,
        error: null,
      });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([
        {
          mission_id: "mission-1",
          mission_title: "ミッション1",
          achievement_count: 2,
        },
        {
          mission_id: "mission-2",
          mission_title: "ミッション2",
          achievement_count: 1,
        },
      ]);
      expect(mockSupabase.from).toHaveBeenCalledWith("achievements");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockSupabase.is).toHaveBeenCalledWith(
        "missions.max_achievement_count",
        null,
      );
    });

    it("達成回数が0のミッションは除外される", async () => {
      const mockAchievementData = [
        {
          mission_id: "mission-1",
          missions: {
            id: "mission-1",
            title: "ミッション1",
            max_achievement_count: null,
          },
        },
      ];

      mockSupabase.is.mockResolvedValue({
        data: mockAchievementData,
        error: null,
      });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([
        {
          mission_id: "mission-1",
          mission_title: "ミッション1",
          achievement_count: 1,
        },
      ]);
    });

    it("mission_idがnullの場合は除外される", async () => {
      const mockAchievementData = [
        {
          mission_id: null,
          missions: {
            id: "mission-1",
            title: "ミッション1",
            max_achievement_count: null,
          },
        },
        {
          mission_id: "mission-2",
          missions: {
            id: "mission-2",
            title: "ミッション2",
            max_achievement_count: null,
          },
        },
      ];

      mockSupabase.is.mockResolvedValue({
        data: mockAchievementData,
        error: null,
      });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([
        {
          mission_id: "mission-2",
          mission_title: "ミッション2",
          achievement_count: 1,
        },
      ]);
    });

    it("missionsがnullの場合は除外される", async () => {
      const mockAchievementData = [
        {
          mission_id: "mission-1",
          missions: null,
        },
        {
          mission_id: "mission-2",
          missions: {
            id: "mission-2",
            title: "ミッション2",
            max_achievement_count: null,
          },
        },
      ];

      mockSupabase.is.mockResolvedValue({
        data: mockAchievementData,
        error: null,
      });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([
        {
          mission_id: "mission-2",
          mission_title: "ミッション2",
          achievement_count: 1,
        },
      ]);
    });

    it("データがnullの場合は空配列を返す", async () => {
      mockSupabase.is.mockResolvedValue({ data: null, error: null });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([]);
    });

    it("エラーが発生した場合は空配列を返す", async () => {
      const mockError = { message: "データベースエラー" };
      mockSupabase.is.mockResolvedValue({ data: null, error: mockError });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([]);
    });

    it("データが空配列の場合は空配列を返す", async () => {
      mockSupabase.is.mockResolvedValue({ data: [], error: null });

      const result = await getUserRepeatableMissionAchievements("user-1");

      expect(result).toEqual([]);
    });
  });
});
