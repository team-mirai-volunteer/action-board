import { adminClient, cleanupTestUser, createTestUser } from "../utils";

describe("get_period_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let seasonId: string;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー1" })
      .eq("id", user1.user.userId);
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー2" })
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
        xp: 100,
        level: 1,
      },
      {
        user_id: user2.user.userId,
        season_id: seasonId,
        xp: 200,
        level: 2,
      },
    ]);
  });

  afterEach(async () => {
    await adminClient
      .from("xp_transactions")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient
      .from("user_levels")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient.from("seasons").delete().eq("id", seasonId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("期間指定のXPランキングが正しく返される", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // XPトランザクションを作成
    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 200,
        source_type: "MISSION_COMPLETION",
      },
    ]);

    const { data, error } = await adminClient.rpc("get_period_ranking", {
      p_limit: 100,
      p_start_date: oneHourAgo.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    // テストユーザーを抽出
    const testUsers = (data ?? []).filter(
      (d: { user_id: string }) =>
        d.user_id === user1.user.userId || d.user_id === user2.user.userId,
    );

    expect(testUsers.length).toBeGreaterThanOrEqual(2);

    const user1Data = testUsers.find(
      (d: { user_id: string }) => d.user_id === user1.user.userId,
    );
    const user2Data = testUsers.find(
      (d: { user_id: string }) => d.user_id === user2.user.userId,
    );
    // user2（200XP）がuser1（100XP）より上位
    expect(Number(user2Data?.rank)).toBeLessThan(Number(user1Data?.rank));
  });

  test("期間指定でフィルタリングが正しく動作する", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // 2時間前のXPトランザクション（user1）
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      created_at: twoHoursAgo.toISOString(),
    });

    // 現在のXPトランザクション（user2）
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user2.user.userId,
      xp_amount: 200,
      source_type: "MISSION_COMPLETION",
      created_at: now.toISOString(),
    });

    // 1時間前以降でフィルタ→ user2のみ
    const { data, error } = await adminClient.rpc("get_period_ranking", {
      p_limit: 100,
      p_start_date: oneHourAgo.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    const user1Data = (data ?? []).find(
      (d: { user_id: string }) => d.user_id === user1.user.userId,
    );
    const user2Data = (data ?? []).find(
      (d: { user_id: string }) => d.user_id === user2.user.userId,
    );
    // user1は期間外なので含まれない
    expect(user1Data).toBeUndefined();
    // user2は期間内なので含まれる
    expect(user2Data).toBeDefined();
  });

  test("limit制限が正しく動作する", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 200,
        source_type: "MISSION_COMPLETION",
      },
    ]);

    const { data, error } = await adminClient.rpc("get_period_ranking", {
      p_limit: 1,
      p_start_date: oneHourAgo.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});

describe("get_user_period_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let seasonId: string;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー1" })
      .eq("id", user1.user.userId);
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー2" })
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
        xp: 100,
        level: 1,
      },
      {
        user_id: user2.user.userId,
        season_id: seasonId,
        xp: 200,
        level: 2,
      },
    ]);
  });

  afterEach(async () => {
    await adminClient
      .from("xp_transactions")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient
      .from("user_levels")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient.from("seasons").delete().eq("id", seasonId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("特定ユーザーの期間ランキングを正しく取得できる", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // user1: 100XP, user2: 300XP
    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 300,
        source_type: "MISSION_COMPLETION",
      },
    ]);

    const { data, error } = await adminClient.rpc("get_user_period_ranking", {
      target_user_id: user1.user.userId,
      start_date: oneHourAgo.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].name).toBe("ユーザー1");
  });

  test("XPトランザクションがない期間ではユーザーは結果に含まれない", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { data, error } = await adminClient.rpc("get_user_period_ranking", {
      target_user_id: user1.user.userId,
      start_date: oneHourAgo.toISOString(),
    });

    expect(error).toBeNull();
    // start_dateを指定した場合、xp_transactionsから集計するため
    // XPトランザクションがなければ結果は空
    expect(data).toHaveLength(0);
  });
});
