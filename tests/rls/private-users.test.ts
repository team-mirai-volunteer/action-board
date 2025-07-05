import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("private_users テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);
  });

  afterEach(async () => {
    // テストユーザーをクリーンアップ
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("認証されていないユーザーはprivate_usersテーブルにアクセスできない", async () => {
    const anonClient = getAnonClient();
    const { data } = await anonClient.from("private_users").select("*");

    expect(data?.length).toBe(0);
  });

  test("認証されたユーザーは自分自身のprivate_usersレコードのみ取得できる", async () => {
    // ユーザー1の自分のデータを取得
    const { data: user1Data, error: user1Error } = await user1.client
      .from("private_users")
      .select("*")
      .eq("id", user1.user.userId)
      .single();

    expect(user1Error).toBeNull();
    expect(user1Data).toBeTruthy();
    expect(user1Data?.id).toBe(user1.user.userId);

    // ユーザー1が他のユーザーのデータを取得しようとする
    const { data: otherUserData, error: otherUserError } = await user1.client
      .from("private_users")
      .select("*")
      .eq("id", user2.user.userId)
      .single();

    expect(otherUserError).toBeTruthy();
    expect(otherUserData).toBeNull();
  });

  test("認証されたユーザーは自分自身のprivate_usersレコードを更新できる", async () => {
    const newName = "Updated Name";

    // ユーザー1が自分のデータを更新
    const { data: updateData, error: updateError } = await user1.client
      .from("private_users")
      .update({ name: newName })
      .eq("id", user1.user.userId)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updateData?.name).toBe(newName);

    // 更新が反映されたか確認
    const { data: checkData } = await user1.client
      .from("private_users")
      .select("name")
      .eq("id", user1.user.userId)
      .single();

    expect(checkData?.name).toBe(newName);
  });

  test("認証されたユーザーは他のユーザーのprivate_usersレコードを更新できない", async () => {
    // ユーザー1がユーザー2のデータを更新しようとする
    const { data: updateData } = await user1.client
      .from("private_users")
      .update({ name: "Hacked Name" })
      .eq("id", user2.user.userId);

    expect(updateData).toBeNull();

    // ユーザー2のデータが変更されていないことを確認（管理者権限で確認）
    const { data: checkData } = await adminClient
      .from("private_users")
      .select("name")
      .eq("id", user2.user.userId)
      .single();

    expect(checkData?.name).toBe("テストユーザー");
  });
});
