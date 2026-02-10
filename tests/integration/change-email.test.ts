import { changeEmail } from "@/features/user-settings/use-cases/change-email";
import { cleanupTestUser, createTestUser } from "./utils";

describe("changeEmail ユースケース", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await cleanupTestUser(testUser.user.userId);
  });

  test("メールアドレスを変更できる", async () => {
    const newEmail = `new-${Date.now()}@example.com`;
    const result = await changeEmail(testUser.client, {
      currentEmail: testUser.user.email,
      newEmail,
    });
    expect(result).toEqual({ success: true });
  });

  test("同じメールアドレスへの変更はエラー", async () => {
    const result = await changeEmail(testUser.client, {
      currentEmail: testUser.user.email,
      newEmail: testUser.user.email,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain("同じ");
  });
});
