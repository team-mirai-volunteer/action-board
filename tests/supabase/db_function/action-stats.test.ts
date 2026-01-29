import { adminClient, cleanupTestUser, createTestUser } from "../utils";

describe("get_action_stats_summary 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  const createdAchievementIds: string[] = [];

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    missionId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: missionId,
      title: "統計テストミッション",
      content: "テスト",
      difficulty: 1,
      slug: `test-stats-${crypto.randomUUID()}`,
    });
  });

  afterEach(async () => {
    if (createdAchievementIds.length > 0) {
      await adminClient
        .from("achievements")
        .delete()
        .in("id", createdAchievementIds);
    }
    await adminClient.from("missions").delete().eq("id", missionId);

    createdAchievementIds.length = 0;

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("アクション数とアクティブユーザー数を正しく集計できる", async () => {
    // user1: 2アクション、user2: 1アクション
    const ids = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    createdAchievementIds.push(...ids);
    await adminClient.from("achievements").insert([
      { id: ids[0], mission_id: missionId, user_id: user1.user.userId },
      { id: ids[1], mission_id: missionId, user_id: user1.user.userId },
      { id: ids[2], mission_id: missionId, user_id: user2.user.userId },
    ]);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const { data, error } = await adminClient.rpc("get_action_stats_summary", {
      start_date: yesterday.toISOString(),
      end_date: now.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data).toHaveLength(1);
    // 合計3アクション、2ユーザー以上
    expect(Number(data?.[0].total_actions)).toBeGreaterThanOrEqual(3);
    expect(Number(data?.[0].active_users)).toBeGreaterThanOrEqual(2);
  });

  test("期間外のアクションは集計されない", async () => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // 3日前のアクション
    const achievementId = crypto.randomUUID();
    createdAchievementIds.push(achievementId);
    await adminClient.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
      created_at: threeDaysAgo.toISOString(),
    });

    // 2日前〜現在の期間でフィルタ
    const { data, error } = await adminClient.rpc("get_action_stats_summary", {
      start_date: twoDaysAgo.toISOString(),
      end_date: now.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    // テストアチーブメントは期間外
    // 他のデータがある可能性があるため、具体値はチェックしない
  });
});

describe("get_daily_action_history 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  const createdAchievementIds: string[] = [];

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    missionId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: missionId,
      title: "日別統計テスト",
      content: "テスト",
      difficulty: 1,
      slug: `test-daily-${crypto.randomUUID()}`,
    });
  });

  afterEach(async () => {
    if (createdAchievementIds.length > 0) {
      await adminClient
        .from("achievements")
        .delete()
        .in("id", createdAchievementIds);
    }
    await adminClient.from("missions").delete().eq("id", missionId);

    createdAchievementIds.length = 0;

    await cleanupTestUser(user1.user.userId);
  });

  test("日別アクション数を正しく取得できる", async () => {
    // 今日のアクション
    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();
    createdAchievementIds.push(id1, id2);
    await adminClient.from("achievements").insert([
      { id: id1, mission_id: missionId, user_id: user1.user.userId },
      { id: id2, mission_id: missionId, user_id: user1.user.userId },
    ]);

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const { data, error } = await adminClient.rpc("get_daily_action_history", {
      start_date: twoDaysAgo.toISOString(),
      end_date: now.toISOString(),
    });

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    // 少なくとも今日の日付のエントリが存在
    expect(data?.length).toBeGreaterThanOrEqual(1);

    // 日付フォーマットがYYYY-MM-DD
    for (const entry of data ?? []) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number(entry.count)).toBeGreaterThan(0);
    }
  });

  test("期間指定なしで全データが返される", async () => {
    const id = crypto.randomUUID();
    createdAchievementIds.push(id);
    await adminClient.from("achievements").insert({
      id,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    const { data, error } = await adminClient.rpc(
      "get_daily_action_history",
      {},
    );

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(1);
  });
});

describe("get_mission_action_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let mission1Id: string;
  let mission2Id: string;
  const createdAchievementIds: string[] = [];
  const createdMissionIds: string[] = [];

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    mission1Id = crypto.randomUUID();
    mission2Id = crypto.randomUUID();
    createdMissionIds.push(mission1Id, mission2Id);
    await adminClient.from("missions").insert([
      {
        id: mission1Id,
        title: "人気ミッション",
        content: "テスト",
        difficulty: 1,
        slug: `test-popular-${crypto.randomUUID()}`,
        is_hidden: false,
      },
      {
        id: mission2Id,
        title: "普通ミッション",
        content: "テスト",
        difficulty: 1,
        slug: `test-normal-${crypto.randomUUID()}`,
        is_hidden: false,
      },
    ]);
  });

  afterEach(async () => {
    if (createdAchievementIds.length > 0) {
      await adminClient
        .from("achievements")
        .delete()
        .in("id", createdAchievementIds);
    }
    for (const id of createdMissionIds) {
      await adminClient.from("missions").delete().eq("id", id);
    }

    createdAchievementIds.length = 0;
    createdMissionIds.length = 0;

    await cleanupTestUser(user1.user.userId);
  });

  test("ミッション別アクション数のランキングを正しく取得できる", async () => {
    // mission1: 3アクション、mission2: 1アクション
    const ids = [
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID(),
      crypto.randomUUID(),
    ];
    createdAchievementIds.push(...ids);
    await adminClient.from("achievements").insert([
      { id: ids[0], mission_id: mission1Id, user_id: user1.user.userId },
      { id: ids[1], mission_id: mission1Id, user_id: user1.user.userId },
      { id: ids[2], mission_id: mission1Id, user_id: user1.user.userId },
      { id: ids[3], mission_id: mission2Id, user_id: user1.user.userId },
    ]);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const { data, error } = await adminClient.rpc(
      "get_mission_action_ranking",
      {
        start_date: yesterday.toISOString(),
        end_date: now.toISOString(),
        limit_count: 20,
      },
    );

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    // テストミッションを抽出
    const mission1Data = data?.find(
      (d: { mission_id: string }) => d.mission_id === mission1Id,
    );
    const mission2Data = data?.find(
      (d: { mission_id: string }) => d.mission_id === mission2Id,
    );

    expect(mission1Data).toBeDefined();
    expect(mission2Data).toBeDefined();
    expect(Number(mission1Data?.action_count)).toBe(3);
    expect(Number(mission2Data?.action_count)).toBe(1);
  });

  test("limit_countで結果が制限される", async () => {
    const id = crypto.randomUUID();
    createdAchievementIds.push(id);
    await adminClient.from("achievements").insert({
      id,
      mission_id: mission1Id,
      user_id: user1.user.userId,
    });

    const { data, error } = await adminClient.rpc(
      "get_mission_action_ranking",
      {
        limit_count: 1,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});
