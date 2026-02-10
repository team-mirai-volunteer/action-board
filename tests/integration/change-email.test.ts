import { changeEmail } from "@/features/user-settings/use-cases/change-email";
import { cleanupTestUser, createTestUser, getUserById } from "./utils";

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

    // ユースケース実行
    const result = await changeEmail(testUser.client, {
      currentEmail: testUser.user.email,
      newEmail,
    });
    expect(result).toEqual({ success: true });

    // DBからユーザーを取得し、メールアドレスが変更されたことを検証
    const updatedUser = await getUserById(testUser.user.userId);
    expect(updatedUser.email).toBe(newEmail);
  });

  test("同じメールアドレスへの変更はエラー", async () => {
    const result = await changeEmail(testUser.client, {
      currentEmail: testUser.user.email,
      newEmail: testUser.user.email,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain("同じ");

    // DBのメールアドレスが変わっていないことを検証
    const user = await getUserById(testUser.user.userId);
    expect(user.email).toBe(testUser.user.email);
  });
});
