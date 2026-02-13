import { lineLogin } from "@/features/auth/use-cases/line-login";
import { FakeLineApiClient } from "./fake-line-api-client";
import {
  adminClient,
  cleanupTestUser,
  findUserByLineId,
  getUserById,
} from "./utils";

describe("lineLogin ユースケース", () => {
  const createdUserIds: string[] = [];

  afterEach(async () => {
    for (const id of createdUserIds) {
      await cleanupTestUser(id);
    }
    createdUserIds.length = 0;
  });

  test("新規LINEユーザーが登録される", async () => {
    const lineUserId = `U_test_${Date.now()}`;
    const email = `test-line-${Date.now()}@example.com`;
    const fakeClient = new FakeLineApiClient(lineUserId, "テスト太郎", email);

    const result = await lineLogin(adminClient, fakeClient, {
      code: "fake-code",
      redirectUri: "http://localhost:3000/api/auth/line-callback",
      dateOfBirth: "1990-01-15",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    createdUserIds.push(result.userId);

    expect(result.isNewUser).toBe(true);
    expect(result.email).toBe(email);

    // DBに正しく保存されているか検証
    const user = await getUserById(result.userId);
    expect(user.email).toBe(email);
    expect(user.user_metadata.provider).toBe("line");
    expect(user.user_metadata.line_user_id).toBe(lineUserId);
    expect(user.user_metadata.date_of_birth).toBe("1990-01-15");
    expect(user.user_metadata.name).toBe("テスト太郎");
    expect(user.user_metadata.line_linked_at).toBeDefined();

    // get_user_by_line_id RPCでも検索できることを検証
    const found = await findUserByLineId(lineUserId);
    expect(found).not.toBeNull();
    expect(found.id).toBe(result.userId);
  });

  test("既存LINEユーザーがログインできる", async () => {
    const lineUserId = `U_test_${Date.now()}`;
    const fakeClient = new FakeLineApiClient(lineUserId, "テスト太郎");

    // 1回目: 新規登録
    const first = await lineLogin(adminClient, fakeClient, {
      code: "fake-code",
      redirectUri: "http://localhost:3000/api/auth/line-callback",
      dateOfBirth: "1990-01-15",
    });
    expect(first.success).toBe(true);
    if (!first.success) return;
    createdUserIds.push(first.userId);

    // line_linked_at を記録
    const userAfterFirst = await getUserById(first.userId);
    const firstLinkedAt = userAfterFirst.user_metadata.line_linked_at;

    // 少し待ってから2回目のログイン（line_linked_atの更新確認のため）
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 2回目: ログイン
    const second = await lineLogin(adminClient, fakeClient, {
      code: "fake-code-2",
      redirectUri: "http://localhost:3000/api/auth/line-callback",
    });
    expect(second.success).toBe(true);
    if (!second.success) return;

    expect(second.isNewUser).toBe(false);
    expect(second.userId).toBe(first.userId);

    // メタデータが更新されていることを検証
    const userAfterSecond = await getUserById(second.userId);
    expect(userAfterSecond.user_metadata.line_linked_at).not.toBe(
      firstLinkedAt,
    );
  });

  test("メールなしLINEユーザーは合成メールで登録される", async () => {
    const lineUserId = `U_noemail_${Date.now()}`;
    const fakeClient = new FakeLineApiClient(lineUserId, "メールなしユーザー");

    const result = await lineLogin(adminClient, fakeClient, {
      code: "fake-code",
      redirectUri: "http://localhost:3000/api/auth/line-callback",
      dateOfBirth: "1990-01-15",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    createdUserIds.push(result.userId);

    // ユースケースの戻り値はSupabase正規化前の値
    expect(result.email).toBe(`line-${lineUserId}@line.local`);

    // DBではSupabaseがメールアドレスを小文字に正規化する
    const user = await getUserById(result.userId);
    expect(user.email).toBe(`line-${lineUserId}@line.local`.toLowerCase());
  });

  test("新規ユーザーでdateOfBirth未指定はエラー", async () => {
    const lineUserId = `U_nodob_${Date.now()}`;
    const fakeClient = new FakeLineApiClient(lineUserId);

    const result = await lineLogin(adminClient, fakeClient, {
      code: "fake-code",
      redirectUri: "http://localhost:3000/api/auth/line-callback",
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toContain("生年月日");

    // ユーザーが作成されていないことを検証
    const found = await findUserByLineId(lineUserId);
    expect(found).toBeNull();
  });

  test("email+passwordユーザーと同じメールのLINEログインはエラー", async () => {
    const email = `emailuser-${Date.now()}@example.com`;
    const { data } = await adminClient.auth.admin.createUser({
      email,
      password: "password123",
      email_confirm: true,
    });
    createdUserIds.push(data.user!.id);

    const lineUserId = `U_conflict_${Date.now()}`;
    const fakeClient = new FakeLineApiClient(lineUserId, "衝突ユーザー", email);

    const result = await lineLogin(adminClient, fakeClient, {
      code: "fake-code",
      redirectUri: "http://localhost:3000/api/auth/line-callback",
      dateOfBirth: "1990-01-15",
    });

    expect(result.success).toBe(false);

    // LINEユーザーが作成されていないことを検証
    const found = await findUserByLineId(lineUserId);
    expect(found).toBeNull();
  });
});
