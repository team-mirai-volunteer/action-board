import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("public_user_profiles テーブルのRLSテスト", () => {
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

  test("匿名ユーザーはpublic_user_profilesテーブルを読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("public_user_profiles")
      .select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(
      data?.some((profile) => profile.id === user1.user.userId),
    ).toBeTruthy();
  });

  test("認証済みユーザーはpublic_user_profilesテーブルを読み取れる", async () => {
    const { data, error } = await user1.client
      .from("public_user_profiles")
      .select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(
      data?.some((profile) => profile.id === user1.user.userId),
    ).toBeTruthy();
  });

  test("匿名ユーザーはpublic_user_profilesテーブルに書き込みできない", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("public_user_profiles")
      .insert({
        id: crypto.randomUUID(),
        name: "Anonymous User",
        address_prefecture: "東京都",
        created_at: new Date().toISOString(),
      });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証済みユーザーはpublic_user_profilesテーブルに直接書き込みできない", async () => {
    const { data, error } = await user1.client
      .from("public_user_profiles")
      .insert({
        id: crypto.randomUUID(),
        name: "Test User Direct Insert",
        address_prefecture: "東京都",
        created_at: new Date().toISOString(),
      });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証されたユーザーは自分自身のpublic_user_profilesレコードを更新できる", async () => {
    const newName = "Updated Public Profile Name";

    // ユーザー1が自分のデータを更新
    const { data: updateData, error: updateError } = await user1.client
      .from("public_user_profiles")
      .update({ name: newName })
      .eq("id", user1.user.userId)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updateData?.name).toBe(newName);

    // 更新が反映されたか確認
    const { data: checkData } = await user1.client
      .from("public_user_profiles")
      .select("name")
      .eq("id", user1.user.userId)
      .single();

    expect(checkData?.name).toBe(newName);
  });

  test("認証されたユーザーは他のユーザーのpublic_user_profilesレコードを更新できない", async () => {
    // ユーザー1がユーザー2のデータを更新しようとする
    const { data: updateData } = await user1.client
      .from("public_user_profiles")
      .update({ name: "編集したテストユーザー" })
      .eq("id", user2.user.userId);

    expect(updateData).toBeNull();

    // ユーザー2のデータが変更されていないことを確認（管理者権限で確認）
    const { data: checkData } = await adminClient
      .from("public_user_profiles")
      .select("name")
      .eq("id", user2.user.userId)
      .single();

    expect(checkData?.name).toBe("テストユーザー");
  });
});
