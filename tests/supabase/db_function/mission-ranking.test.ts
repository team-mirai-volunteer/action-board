import { adminClient, cleanupTestUser, createTestUser } from "../utils";

describe("get_mission_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  const createdMissionIds: string[] = [];
  const createdAchievementIds: string[] = [];

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

    missionId = crypto.randomUUID();
    createdMissionIds.push(missionId);
    const { error } = await adminClient.from("missions").insert({
      id: missionId,
      title: "テストミッション",
      content: "テスト用ミッション",
      difficulty: 1,
      slug: `test-mission-${crypto.randomUUID()}`,
    });
    if (error) throw new Error(`ミッション作成エラー: ${error.message}`);
  });

  afterEach(async () => {
    await adminClient
      .from("xp_transactions")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    for (const id of createdMissionIds) {
      await adminClient.from("achievements").delete().eq("mission_id", id);
    }
    for (const id of createdMissionIds) {
      await adminClient.from("missions").delete().eq("id", id);
    }
    createdMissionIds.length = 0;
    createdAchievementIds.length = 0;

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("ミッション達成数に基づく順位が正しく計算される", async () => {
    // user1: 1回達成 + 100XP
    const achievementId1 = crypto.randomUUID();
    createdAchievementIds.push(achievementId1);
    await adminClient.from("achievements").insert({
      id: achievementId1,
      mission_id: missionId,
      user_id: user1.user.userId,
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId1,
    });

    // user2: 2回達成 + 200XP
    const achievementId2a = crypto.randomUUID();
    const achievementId2b = crypto.randomUUID();
    createdAchievementIds.push(achievementId2a, achievementId2b);
    await adminClient.from("achievements").insert([
      {
        id: achievementId2a,
        mission_id: missionId,
        user_id: user2.user.userId,
      },
      {
        id: achievementId2b,
        mission_id: missionId,
        user_id: user2.user.userId,
      },
    ]);
    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        source_id: achievementId2a,
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        source_id: achievementId2b,
      },
    ]);

    const { data, error } = await adminClient.rpc("get_mission_ranking", {
      mission_id: missionId,
      limit_count: 10,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    // user2が1位（200XP、2回達成）
    expect(data?.[0].user_name).toBe("ユーザー2");
    expect(data?.[0].total_points).toBe(200);
    expect(data?.[0].clear_count).toBe(2);
    expect(data?.[0].rank).toBe(1);
    // user1が2位（100XP、1回達成）
    expect(data?.[1].user_name).toBe("ユーザー1");
    expect(data?.[1].total_points).toBe(100);
    expect(data?.[1].clear_count).toBe(1);
    expect(data?.[1].rank).toBe(2);
  });

  test("limit_countで結果が制限される", async () => {
    // 両ユーザーがミッション達成
    for (const user of [user1, user2]) {
      const achievementId = crypto.randomUUID();
      createdAchievementIds.push(achievementId);
      await adminClient.from("achievements").insert({
        id: achievementId,
        mission_id: missionId,
        user_id: user.user.userId,
      });
      await adminClient.from("xp_transactions").insert({
        id: crypto.randomUUID(),
        user_id: user.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        source_id: achievementId,
      });
    }

    const { data, error } = await adminClient.rpc("get_mission_ranking", {
      mission_id: missionId,
      limit_count: 1,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  test("達成者がいないミッションでは空の結果が返る", async () => {
    const { data, error } = await adminClient.rpc("get_mission_ranking", {
      mission_id: missionId,
      limit_count: 10,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});

describe("get_user_mission_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  const createdAchievementIds: string[] = [];

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

    missionId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: missionId,
      title: "テストミッション",
      content: "テスト",
      difficulty: 1,
      slug: `test-mission-${crypto.randomUUID()}`,
    });
  });

  afterEach(async () => {
    await adminClient
      .from("xp_transactions")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId]);
    await adminClient.from("achievements").delete().eq("mission_id", missionId);
    await adminClient.from("missions").delete().eq("id", missionId);

    createdAchievementIds.length = 0;

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("特定ユーザーのミッション内順位を正しく取得できる", async () => {
    // user1: 100XP（2位）
    const achievementId1 = crypto.randomUUID();
    createdAchievementIds.push(achievementId1);
    await adminClient.from("achievements").insert({
      id: achievementId1,
      mission_id: missionId,
      user_id: user1.user.userId,
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId1,
    });

    // user2: 200XP（1位）
    const achievementId2a = crypto.randomUUID();
    const achievementId2b = crypto.randomUUID();
    createdAchievementIds.push(achievementId2a, achievementId2b);
    await adminClient.from("achievements").insert([
      {
        id: achievementId2a,
        mission_id: missionId,
        user_id: user2.user.userId,
      },
      {
        id: achievementId2b,
        mission_id: missionId,
        user_id: user2.user.userId,
      },
    ]);
    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        source_id: achievementId2a,
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        source_id: achievementId2b,
      },
    ]);

    // user1のランキングを取得
    const { data, error } = await adminClient.rpc("get_user_mission_ranking", {
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_name).toBe("ユーザー1");
    expect(data?.[0].total_points).toBe(100);
    expect(data?.[0].rank).toBe(2);
  });

  test("ミッション未達成のユーザーは結果に含まれない", async () => {
    const { data, error } = await adminClient.rpc("get_user_mission_ranking", {
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});
