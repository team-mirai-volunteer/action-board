import {
  checkLevelUpNotification,
  markLevelUpNotificationAsSeen,
} from "./levelUpNotification";

jest.mock("@/lib/supabase/server", () => ({
  createServiceClient: jest.fn(),
}));
jest.mock("@/lib/utils/utils", () => ({
  totalXp: jest.fn(),
}));

const { createServiceClient } = require("@/lib/supabase/server");
const { totalXp } = require("@/lib/utils/utils");
const mockCreateServiceClient = createServiceClient as jest.MockedFunction<
  typeof createServiceClient
>;
const mockTotalXp = totalXp as jest.MockedFunction<typeof totalXp>;

describe("levelUpNotification service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };
    mockCreateServiceClient.mockResolvedValue(mockSupabase);

    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.from.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkLevelUpNotification", () => {
    it("レベルアップした場合は通知データを返す", async () => {
      const mockUserLevel = {
        user_id: "user-1",
        level: 5,
        xp: 500,
        last_notified_level: 3,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserLevel,
        error: null,
      });
      mockTotalXp.mockReturnValue(600);

      const result = await checkLevelUpNotification("user-1");

      expect(result).toEqual({
        shouldNotify: true,
        levelUp: {
          previousLevel: 3,
          newLevel: 5,
          pointsToNextLevel: 100,
        },
      });
      expect(mockSupabase.from).toHaveBeenCalledWith("user_levels");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockTotalXp).toHaveBeenCalledWith(6);
    });

    it("レベルアップしていない場合は通知しない", async () => {
      const mockUserLevel = {
        user_id: "user-1",
        level: 5,
        xp: 500,
        last_notified_level: 5,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserLevel,
        error: null,
      });

      const result = await checkLevelUpNotification("user-1");

      expect(result).toEqual({ shouldNotify: false });
    });

    it("last_notified_levelがnullの場合はデフォルト値1を使用", async () => {
      const mockUserLevel = {
        user_id: "user-1",
        level: 3,
        xp: 300,
        last_notified_level: null,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserLevel,
        error: null,
      });
      mockTotalXp.mockReturnValue(400);

      const result = await checkLevelUpNotification("user-1");

      expect(result).toEqual({
        shouldNotify: true,
        levelUp: {
          previousLevel: 1,
          newLevel: 3,
          pointsToNextLevel: 100,
        },
      });
    });

    it("次のレベルまでのポイントが負の場合は0を返す", async () => {
      const mockUserLevel = {
        user_id: "user-1",
        level: 5,
        xp: 700,
        last_notified_level: 3,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserLevel,
        error: null,
      });
      mockTotalXp.mockReturnValue(600);

      const result = await checkLevelUpNotification("user-1");

      expect(result.levelUp?.pointsToNextLevel).toBe(0);
    });

    it("ユーザーレベルが見つからない場合は通知しない", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const result = await checkLevelUpNotification("user-1");

      expect(result).toEqual({ shouldNotify: false });
    });

    it("エラーが発生した場合は通知しない", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "データベースエラー" },
      });

      const result = await checkLevelUpNotification("user-1");

      expect(result).toEqual({ shouldNotify: false });
    });
  });

  describe("markLevelUpNotificationAsSeen", () => {
    it("通知を確認済みとしてマークする", async () => {
      const mockUserLevel = { level: 5 };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserLevel,
        error: null,
      });
      mockSupabase.eq.mockReturnValueOnce(mockSupabase);
      mockSupabase.update.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockResolvedValueOnce({ error: null });

      const result = await markLevelUpNotificationAsSeen("user-1");

      expect(result).toEqual({ success: true });
      expect(mockSupabase.update).toHaveBeenCalledWith({
        last_notified_level: 5,
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("ユーザーレベルの取得に失敗した場合はエラーを返す", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "ユーザーが見つかりません" },
      });

      const result = await markLevelUpNotificationAsSeen("user-1");

      expect(result).toEqual({
        success: false,
        error: "ユーザーレベルの取得に失敗しました",
      });
    });

    it("ユーザーレベルがnullの場合はエラーを返す", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const result = await markLevelUpNotificationAsSeen("user-1");

      expect(result).toEqual({
        success: false,
        error: "ユーザーレベルの取得に失敗しました",
      });
    });

    it("更新に失敗した場合はエラーを返す", async () => {
      const mockUserLevel = { level: 5 };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserLevel,
        error: null,
      });
      mockSupabase.eq.mockReturnValueOnce(mockSupabase);
      mockSupabase.update.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockResolvedValueOnce({
        error: { message: "更新エラー" },
      });

      const result = await markLevelUpNotificationAsSeen("user-1");

      expect(result).toEqual({
        success: false,
        error: "通知状態の更新に失敗しました",
      });
    });

    it("予期しないエラーが発生した場合はエラーを返す", async () => {
      mockSupabase.single.mockRejectedValue(new Error("予期しないエラー"));

      const result = await markLevelUpNotificationAsSeen("user-1");

      expect(result).toEqual({
        success: false,
        error: "予期しないエラーが発生しました",
      });
    });
  });
});
