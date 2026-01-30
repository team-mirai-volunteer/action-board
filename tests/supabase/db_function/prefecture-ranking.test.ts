import { adminClient, cleanupTestUser, createTestUser } from "../utils";

describe("get_prefecture_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let seasonId: string;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // 同一都道府県に設定
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー1", address_prefecture: "大阪府" })
      .eq("id", user1.user.userId);
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー2", address_prefecture: "大阪府" })
      .eq("id", user2.user.userId);

    // テスト用シーズンを作成
    seasonId = crypto.randomUUID();
    await adminClient.from("seasons").insert({
      id: seasonId,
      slug: `test-season-${crypto.randomUUID()}`,
      name: "テストシーズン",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: false,
    });

    // user_levelsに異なるXPを設定
    await adminClient.from("user_levels").insert([
      {
        user_id: user1.user.userId,
        season_id: seasonId,
        xp: 300,
        level: 3,
      },
      {
        user_id: user2.user.userId,
        season_id: seasonId,
        xp: 500,
        level: 5,
      },
    ]);
  });

  afterEach(async () => {
    await adminClient
      .from("user_levels")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient.from("seasons").delete().eq("id", seasonId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("XP順で都道府県ランキングが正しく返される", async () => {
    const { data, error } = await adminClient.rpc("get_prefecture_ranking", {
      prefecture: "大阪府",
      limit_count: 10,
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    // テストユーザーのデータを抽出
    const testUsers = (data ?? []).filter(
      (d: { user_id: string }) =>
        d.user_id === user1.user.userId || d.user_id === user2.user.userId,
    );
    expect(testUsers).toHaveLength(2);

    // user2（500XP）がuser1（300XP）より上位
    const user2Data = testUsers.find(
      (d: { user_id: string }) => d.user_id === user2.user.userId,
    );
    const user1Data = testUsers.find(
      (d: { user_id: string }) => d.user_id === user1.user.userId,
    );
    expect(user2Data?.xp).toBe(500);
    expect(user1Data?.xp).toBe(300);
    expect(Number(user2Data?.rank)).toBeLessThan(Number(user1Data?.rank));
  });

  test("limit_countで結果が制限される", async () => {
    const { data, error } = await adminClient.rpc("get_prefecture_ranking", {
      prefecture: "大阪府",
      limit_count: 1,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  test("該当しない都道府県では空の結果が返る", async () => {
    const { data, error } = await adminClient.rpc("get_prefecture_ranking", {
      prefecture: "テスト県_存在しない",
      limit_count: 10,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});

describe("get_user_prefecture_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let seasonId: string;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー1", address_prefecture: "北海道" })
      .eq("id", user1.user.userId);
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー2", address_prefecture: "北海道" })
      .eq("id", user2.user.userId);

    seasonId = crypto.randomUUID();
    await adminClient.from("seasons").insert({
      id: seasonId,
      slug: `test-season-${crypto.randomUUID()}`,
      name: "テストシーズン",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: false,
    });

    await adminClient.from("user_levels").insert([
      {
        user_id: user1.user.userId,
        season_id: seasonId,
        xp: 200,
        level: 2,
      },
      {
        user_id: user2.user.userId,
        season_id: seasonId,
        xp: 400,
        level: 4,
      },
    ]);
  });

  afterEach(async () => {
    await adminClient
      .from("user_levels")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient.from("seasons").delete().eq("id", seasonId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("特定ユーザーの都道府県内順位を正しく取得できる", async () => {
    const { data, error } = await adminClient.rpc(
      "get_user_prefecture_ranking",
      {
        prefecture: "北海道",
        target_user_id: user1.user.userId,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_name).toBe("ユーザー1");
    expect(data?.[0].xp).toBe(200);
    expect(data?.[0].address_prefecture).toBe("北海道");
  });

  test("別の都道府県を指定すると結果が返らない", async () => {
    const { data, error } = await adminClient.rpc(
      "get_user_prefecture_ranking",
      {
        prefecture: "沖縄県",
        target_user_id: user1.user.userId,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});
