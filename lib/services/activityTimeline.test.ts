import { createClient } from "@/lib/supabase/server";
import {
  getUserActivityTimeline,
  getUserActivityTimelineCount,
} from "./activityTimeline";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("activityTimeline service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("getUserActivityTimeline", () => {
    const userId = "test-user-id";

    it("achievements + user_activitiesを統合して時系列順に返す", async () => {
      const mockAchievements = [
        {
          id: "achievement-1",
          created_at: "2024-01-02T00:00:00Z",
          user_id: userId,
          missions: { title: "テストミッション1" },
        },
      ];

      const mockActivities = [
        {
          id: "activity-1",
          created_at: "2024-01-01T00:00:00Z",
          activity_title: "サインアップ",
          activity_type: "signup",
          user_id: userId,
        },
      ];

      const mockUserProfile = {
        id: userId,
        name: "テストユーザー",
        address_prefecture: "東京都",
        avatar_url: null,
      };

      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(result),
        single: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(
          createMockChain({ data: mockAchievements, error: null }),
        )
        .mockReturnValueOnce(
          createMockChain({ data: mockActivities, error: null }),
        )
        .mockReturnValueOnce(
          createMockChain({ data: mockUserProfile, error: null }),
        );

      const result = await getUserActivityTimeline(userId, 20, 0);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "achievement_achievement-1",
        user_id: userId,
        name: "テストユーザー",
        title: "テストミッション1",
        activity_type: "mission_achievement",
      });
      expect(result[1]).toMatchObject({
        id: "activity_activity-1",
        user_id: userId,
        name: "テストユーザー",
        title: "サインアップ",
        activity_type: "signup",
      });
    });

    it("achievementsエラー時はconsole.error + return []パターンで処理する", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(result),
        single: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(
          createMockChain({ data: null, error: { message: "Database error" } }),
        )
        .mockReturnValueOnce(createMockChain({ data: [], error: null }))
        .mockReturnValueOnce(createMockChain({ data: null, error: null }));

      const result = await getUserActivityTimeline(userId);

      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch achievements:", {
        message: "Database error",
      });
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it("user_activitiesエラー時はconsole.error + return []パターンで処理する", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(result),
        single: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(createMockChain({ data: [], error: null }))
        .mockReturnValueOnce(
          createMockChain({
            data: null,
            error: { message: "Activities error" },
          }),
        )
        .mockReturnValueOnce(createMockChain({ data: null, error: null }));

      const result = await getUserActivityTimeline(userId);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch user activities:",
        { message: "Activities error" },
      );
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it("limit, offsetパラメータが正しく動作する", async () => {
      const mockRange = jest.fn().mockResolvedValue({ data: [], error: null });

      const createMockChain = (rangeMethod?: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range:
          rangeMethod || jest.fn().mockResolvedValue({ data: [], error: null }),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      mockSupabase.from
        .mockReturnValueOnce(createMockChain(mockRange))
        .mockReturnValueOnce(createMockChain())
        .mockReturnValueOnce(createMockChain());

      await getUserActivityTimeline(userId, 10, 5);

      expect(mockRange).toHaveBeenCalledWith(5, 9);
    });

    it("ActivityTimelineItem形式に正しく変換される", async () => {
      const mockAchievement = {
        id: "achievement-1",
        created_at: "2024-01-01T12:00:00Z",
        user_id: userId,
        missions: { title: "テストミッション" },
      };

      const mockUserProfile = {
        id: userId,
        name: "テストユーザー",
        address_prefecture: "大阪府",
        avatar_url: "https://example.com/avatar.jpg",
      };

      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue(result),
        single: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(
          createMockChain({ data: [mockAchievement], error: null }),
        )
        .mockReturnValueOnce(createMockChain({ data: [], error: null }))
        .mockReturnValueOnce(
          createMockChain({ data: mockUserProfile, error: null }),
        );

      const result = await getUserActivityTimeline(userId);

      expect(result[0]).toEqual({
        id: "achievement_achievement-1",
        user_id: userId,
        name: "テストユーザー",
        address_prefecture: "大阪府",
        avatar_url: "https://example.com/avatar.jpg",
        title: "テストミッション",
        created_at: "2024-01-01T12:00:00Z",
        activity_type: "mission_achievement",
      });
    });
  });

  describe("getUserActivityTimelineCount", () => {
    const userId = "test-user-id";

    it("両テーブルのカウント合計を返す", async () => {
      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(createMockChain({ count: 5, error: null }))
        .mockReturnValueOnce(createMockChain({ count: 3, error: null }));

      const result = await getUserActivityTimelineCount(userId);

      expect(result).toBe(8);
    });

    it("countがnullの場合は0として扱う", async () => {
      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(createMockChain({ count: null, error: null }))
        .mockReturnValueOnce(createMockChain({ count: 2, error: null }));

      const result = await getUserActivityTimelineCount(userId);

      expect(result).toBe(2);
    });

    it("エラー時は0を返す", async () => {
      const createMockChain = (result: any) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(result),
      });

      mockSupabase.from
        .mockReturnValueOnce(
          createMockChain({
            count: null,
            error: { message: "Database error" },
          }),
        )
        .mockReturnValueOnce(
          createMockChain({
            count: null,
            error: { message: "Database error" },
          }),
        );

      const result = await getUserActivityTimelineCount(userId);

      expect(result).toBe(0);
    });
  });
});
