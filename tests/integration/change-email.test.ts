import {
  changeEmail,
  type UpdateEmailFn,
} from "@/features/user-settings/use-cases/change-email";
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getUserById,
} from "./utils";

/**
 * admin API経由のメール更新関数（CI環境用）
 * SMTPが無効な環境でもメール変更をテスト可能にする
 */
function createAdminUpdateEmail(userId: string): UpdateEmailFn {
  return async (newEmail) => {
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      email: newEmail,
    });
    return { error };
  };
}

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

    // admin API経由のUpdateEmailFnを注入（CI環境ではSMTPが無効のため）
    const updateEmail = createAdminUpdateEmail(testUser.user.userId);
    const result = await changeEmail(updateEmail, {
      currentEmail: testUser.user.email,
      newEmail,
    });
    expect(result).toEqual({ success: true });

    // DBからユーザーを取得し、メールアドレスが変更されたことを検証
    const updatedUser = await getUserById(testUser.user.userId);
    expect(updatedUser.email).toBe(newEmail);
  });

  test("同じメールアドレスへの変更はエラー", async () => {
    const updateEmail = createAdminUpdateEmail(testUser.user.userId);
    const result = await changeEmail(updateEmail, {
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
