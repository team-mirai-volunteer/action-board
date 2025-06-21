import { markLevelUpSeenAction } from "../../../app/actions/level-up";

jest.mock("../../../lib/services/levelUpNotification", () => ({
  markLevelUpNotificationAsSeen: jest.fn(() =>
    Promise.resolve({ success: true }),
  ),
}));

jest.mock("../../../lib/services/users", () => ({
  getUser: jest.fn(() =>
    Promise.resolve({ id: "test-id", email: "test@example.com" }),
  ),
}));

describe("markLevelUpSeenAction", () => {
  it("レベルアップ通知の正常処理", async () => {
    const result = await markLevelUpSeenAction();
    expect(result.success).toBe(true);
  });

  it("ユーザー未認証時の処理", async () => {
    const mockGetUser = require("../../../lib/services/users").getUser;
    mockGetUser.mockResolvedValue(null);
    const result = await markLevelUpSeenAction();
    expect(result.success).toBe(false);
    expect(result.error).toBe("認証が必要です");
  });
});
