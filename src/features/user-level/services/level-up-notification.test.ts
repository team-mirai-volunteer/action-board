import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { totalXp } from "../utils/level-calculator";
import { checkLevelUpNotification } from "./level-up-notification";
import { markLevelUpNotificationAsSeen } from "./level-up-notification";

jest.mock("@/lib/services/seasons", () => ({ getCurrentSeasonId: jest.fn() }));
jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));
// このモジュールはモック化せず,引用元の関数を直接使用することを明示
jest.mock("@/features/user-level/services/level-up-notification", () =>
  jest.requireActual("@/features/user-level/services/level-up-notification"),
);

// 共通定数とセットアップ
const SEASON_ID = "season1";

beforeEach(() => {
  jest.clearAllMocks();
  (getCurrentSeasonId as jest.Mock).mockResolvedValue(SEASON_ID);
});

// ビジネスロジック確認のみ実施のため、防御的な異常系のテストは省略
describe("checkLevelUpNotification", () => {
  function createSupabaseMock<T>(response: T) {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(response),
    };
    return {
      from: jest.fn().mockReturnValue(query),
      __query: query,
    };
  }

  it("正常系: レベルアップしている場合は通知し、次レベルまでのポイントを返す", async () => {
    const currentLevel = 4;
    const xp = totalXp(currentLevel) + 10; // レベル内で10ポイント進捗
    const userLevel = {
      user_id: "user1",
      season_id: "season1",
      level: currentLevel,
      last_notified_level: 2,
      xp,
    };
    (createAdminClient as jest.Mock).mockResolvedValue(
      createSupabaseMock({ data: userLevel, error: null }),
    );

    // 次レベルまでのポイント計算
    const nextLevelPoints = totalXp(currentLevel + 1);
    const pointsToNextLevel = nextLevelPoints - userLevel.xp;

    const result = await checkLevelUpNotification("user1");

    expect(result).toEqual({
      shouldNotify: true,
      levelUp: {
        previousLevel: 2,
        newLevel: currentLevel,
        pointsToNextLevel: Math.max(0, pointsToNextLevel),
      },
    });
  });

  it("正常系: 最後に通知したレベルが未設定の場合は1として扱いレベルアップを通知する", async () => {
    const currentLevel = 2;
    const xp = totalXp(currentLevel); // レベル開始時
    const userLevel = {
      user_id: "user1",
      season_id: "season1",
      level: currentLevel,
      last_notified_level: null,
      xp,
    };
    (createAdminClient as jest.Mock).mockResolvedValue(
      createSupabaseMock({ data: userLevel, error: null }),
    );

    const lastNotifiedLevel = userLevel.last_notified_level || 1;

    const result = await checkLevelUpNotification("user1");
    const expectedPointsToNext = totalXp(currentLevel + 1) - xp;
    expect(result).toEqual({
      shouldNotify: true,
      levelUp: {
        previousLevel: lastNotifiedLevel,
        newLevel: currentLevel,
        pointsToNextLevel: expectedPointsToNext,
      },
    });
  });

  it("正常系: 現在レベルが最後に通知したレベル以下なら通知しない", async () => {
    const userLevel = {
      user_id: "user1",
      season_id: "season1",
      level: 3,
      last_notified_level: 3,
      xp: totalXp(3),
    };
    (createAdminClient as jest.Mock).mockResolvedValue(
      createSupabaseMock({ data: userLevel, error: null }),
    );

    const result = await checkLevelUpNotification("user1");
    expect(result).toEqual({ shouldNotify: false });
  });
});

// ビジネスロジック確認のみ実施のため、防御的な異常系のテストは省略
describe("markLevelUpNotificationAsSeen", () => {
  function createSupabaseMockWithUpdate(options: {
    selectResponse: {
      data: { level: number } | null;
      error: { message: string } | null;
    };
    updateError?: { message: string } | null;
  }) {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(options.selectResponse),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest
            .fn()
            .mockResolvedValue({ error: options.updateError ?? null }),
        }),
      }),
    };
    return {
      from: jest.fn().mockReturnValue(query),
      __query: query,
    };
  }

  it("正常系: 現在のレベルでlast_notified_levelを更新して成功を返す", async () => {
    (createAdminClient as jest.Mock).mockResolvedValue(
      createSupabaseMockWithUpdate({
        selectResponse: { data: { level: 5 }, error: null },
        updateError: null,
      }),
    );

    const result = await markLevelUpNotificationAsSeen("user1");
    expect(result).toEqual({ success: true });
  });

  it("異常系: 更新に失敗した場合は失敗を返す", async () => {
    (createAdminClient as jest.Mock).mockResolvedValue(
      createSupabaseMockWithUpdate({
        selectResponse: { data: { level: 5 }, error: null },
        updateError: { message: "update error" },
      }),
    );

    const result = await markLevelUpNotificationAsSeen("user1");
    expect(result).toEqual({
      success: false,
      error: "通知状態の更新に失敗しました",
    });
  });
});
