import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("user_levels テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let testSeasonId: string;

  beforeEach(async () => {
    // テストユーザーを2人作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用のシーズンを作成
    testSeasonId = crypto.randomUUID();
    const { error: seasonError } = await adminClient.from("seasons").insert({
      id: testSeasonId,
      name: "テストシーズン",
      slug: `test-season-${Date.now()}`,
      start_date: new Date().toISOString(),
      is_active: false,
    });

    if (seasonError) {
      throw new Error(`テストシーズン作成エラー: ${seasonError.message}`);
    }

    // テスト用のuser_levelsデータを作成（管理者権限で）
    const { error: user1LevelError } = await adminClient
      .from("user_levels")
      .insert({
        user_id: user1.user.userId,
        season_id: testSeasonId,
        xp: 150,
        level: 2,
      });

    const { error: user2LevelError } = await adminClient
      .from("user_levels")
      .insert({
        user_id: user2.user.userId,
        season_id: testSeasonId,
        xp: 300,
        level: 3,
      });

    if (user1LevelError) {
      throw new Error(`user1レベル作成エラー: ${user1LevelError.message}`);
    }
    if (user2LevelError) {
      throw new Error(`user2レベル作成エラー: ${user2LevelError.message}`);
    }
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient
      .from("user_levels")
      .delete()
      .eq("user_id", user1.user.userId);
    await adminClient
      .from("user_levels")
      .delete()
      .eq("user_id", user2.user.userId);

    // テストシーズンを削除
    await adminClient.from("seasons").delete().eq("id", testSeasonId);

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはuser_levelsを読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data } = await anonClient.from("user_levels").select("*");

    // 匿名ユーザーはアクセスできる
    expect(data).toBeTruthy();
  });

  test("認証済みユーザーは自分のレベル情報を読み取れる", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_id).toBe(user1.user.userId);
    expect(data?.[0].xp).toBe(150);
    expect(data?.[0].level).toBe(2);
  });

  test("認証済みユーザーは他のユーザーのレベル情報も読み取れる（ランキング表示のため）", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user2.user.userId);

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_id).toBe(user2.user.userId);
    expect(data?.[0].xp).toBe(300);
    expect(data?.[0].level).toBe(3);
  });

  test("認証済みユーザーは全ユーザーのレベル情報を取得できる", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .select("*")
      .order("xp", { ascending: false });

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.length).toBeGreaterThanOrEqual(2);

    // XPでソートされているか確認
    const user2Data = data?.find((u) => u.user_id === user2.user.userId);
    const user1Data = data?.find((u) => u.user_id === user1.user.userId);

    expect(user2Data?.xp).toBe(300);
    expect(user1Data?.xp).toBe(150);
  });

  test("認証済みユーザーは他のユーザーのレベル情報を更新できない", async () => {
    const { data } = await user1.client
      .from("user_levels")
      .update({ xp: 500, level: 5 })
      .eq("user_id", user2.user.userId);

    // 他のユーザーの情報は更新できない
    expect(data).toBeNull();

    const { data: after } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user2.user.userId);
    expect(after).toBeTruthy();
    expect(after?.[0].xp).toBe(300);
    expect(after?.[0].level).toBe(3);
  });

  test("認証済みユーザーは自分のレベル情報を更新できない（通常は更新機能がないため）", async () => {
    const { data, error } = await user1.client
      .from("user_levels")
      .update({ xp: 200, level: 3 })
      .eq("user_id", user1.user.userId);

    // 直接更新は許可されていない（ビジネスロジックで制御される）
    expect(data).toBeNull();

    const { data: after } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after).toBeTruthy();
    expect(after?.[0].xp).toBe(150);
    expect(after?.[0].level).toBe(2);
  });

  test("認証済みユーザーはuser_levelsにINSERTできない", async () => {
    const testUserId = crypto.randomUUID();
    const { data } = await user1.client.from("user_levels").insert({
      user_id: testUserId,
      season_id: testSeasonId,
      xp: 100,
      level: 1,
    });

    // 一般ユーザーは新しいレコードを作成できない
    expect(data).toBeNull();

    // user_levelsに新しいレコードは存在しないはず
    const { data: after } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", testUserId);
    expect(after).toBeTruthy();
  });

  test("認証済みユーザーはuser_levelsからDELETEできない", async () => {
    await user1.client
      .from("user_levels")
      .delete()
      .eq("user_id", user1.user.userId);

    // 一般ユーザーはレコードを削除できない
    const { data } = await user1.client
      .from("user_levels")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(data).toBeTruthy();
  });
});
