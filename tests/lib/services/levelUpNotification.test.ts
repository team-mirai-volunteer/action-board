import {
  checkLevelUpNotification,
  markLevelUpNotificationAsSeen,
} from "../../../lib/services/levelUpNotification";

jest.mock("../../../lib/supabase/server", () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() =>
            Promise.resolve({
              data: { level: 5, last_notified_level: 3, xp: 1000 },
              error: null,
            }),
          ),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  })),
}));

describe("checkLevelUpNotification", () => {
  it("レベルアップ通知チェック", async () => {
    const result = await checkLevelUpNotification("user123");
    expect(result.shouldNotify).toBe(true);
  });

  it("空ユーザーIDで通知チェック", async () => {
    const result = await checkLevelUpNotification("");
    expect(result.shouldNotify).toBe(true);
  });
});
