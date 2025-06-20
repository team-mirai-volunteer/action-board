import { checkLevelUpAction } from "../../../app/actions/level-up";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: "test-id" } } }),
      ),
    },
  })),
}));

jest.mock("../../../lib/services/levelUpNotification", () => ({
  checkLevelUpNotification: jest.fn(() =>
    Promise.resolve({ shouldNotify: true, levelUp: { level: 2 } }),
  ),
}));

describe("checkLevelUpAction", () => {
  it("レベルアップチェックの正常処理", async () => {
    const result = await checkLevelUpAction();
    expect(result.shouldNotify).toBe(true);
    expect(result.levelUp).toBeDefined();
  });

  it("ユーザー未認証時の処理", async () => {
    const mockCreateClient =
      require("../../../lib/supabase/server").createClient;
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null } })),
      },
    });
    const result = await checkLevelUpAction();
    expect(result.shouldNotify).toBe(false);
  });
});
