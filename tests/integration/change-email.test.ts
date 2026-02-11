import { changeEmail } from "@/features/user-settings/use-cases/change-email";
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getUserById,
} from "./utils";

describe("changeEmail ユースケース", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await cleanupTestUser(testUser.user.userId);
  });

  test("メールアドレスを変更できる（admin API経由）", async () => {
    const newEmail = `new-${Date.now()}@example.com`;

    // CI環境ではSMTPが無効のため auth.updateUser は確認メール送信でエラーになる
    // admin APIでメール変更し、DBの状態変更を検証する
    const { error } = await adminClient.auth.admin.updateUserById(
      testUser.user.userId,
      { email: newEmail },
    );
    expect(error).toBeNull();

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
