import { adminClient, cleanupTestUser, createTestUser } from "../rls/utils";

describe("get_period_mission_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // ユーザー名を設定（ランキングの順位確認用）
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー1" })
      .eq("id", user1.user.userId);
    await adminClient
      .from("public_user_profiles")
      .update({ name: "ユーザー2" })
      .eq("id", user2.user.userId);

    // テスト用ミッションを作成（管理者権限で）
    missionId = crypto.randomUUID();
    const missionData = {
      id: missionId,
      title: "テストミッション",
      content: "これはテスト用のミッションです",
      difficulty: 1,
      slug: `test-mission-${crypto.randomUUID()}`,
    };

    const { error } = await adminClient.from("missions").insert(missionData);
    if (error) throw new Error(`ミッション作成エラー: ${error.message}`);
  });

  afterEach(async () => {
    // テストデータをクリーンアップ（依存関係の順序で削除）
    await adminClient
      .from("xp_transactions")
      .delete()
      .eq("source_type", "MISSION_COMPLETION");
    await adminClient
      .from("xp_transactions")
      .delete()
      .eq("source_type", "BONUS");
    await adminClient
      .from("posting_activities")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient
      .from("mission_artifacts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("achievements").delete().eq("mission_id", missionId);
    await adminClient.from("missions").delete().eq("id", missionId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("通常ミッションでtotal_pointsがxp_transactionsから正しく計算される", async () => {
    // user1がミッションを達成
    const achievementId1 = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: achievementId1,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    // xp_transactionを作成（100XP）
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId1,
    });

    // user2がミッションを2回達成
    const achievementId2a = crypto.randomUUID();
    const achievementId2b = crypto.randomUUID();
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

    // xp_transactionを作成（100XP × 2 = 200XP）
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

    // ランキングを取得
    const { data, error } = await adminClient.rpc(
      "get_period_mission_ranking",
      {
        p_mission_id: missionId,
        p_limit: 10,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(2);

    // user2が1位（200XP）
    expect(data?.[0].user_name).toBe("ユーザー2");
    expect(data?.[0].total_points).toBe(200);
    expect(data?.[0].user_achievement_count).toBe(2);
    expect(data?.[0].rank).toBe(1);

    // user1が2位（100XP）
    expect(data?.[1].user_name).toBe("ユーザー1");
    expect(data?.[1].total_points).toBe(100);
    expect(data?.[1].user_achievement_count).toBe(1);
    expect(data?.[1].rank).toBe(2);
  });

  test("ポスティングミッションでBONUSタイプのXPが正しく計算される", async () => {
    // POSTINGミッションを作成
    const postingMissionId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: postingMissionId,
      title: "ポスティングミッション",
      content: "ポスティングテスト",
      difficulty: 1,
      slug: `posting-mission-${crypto.randomUUID()}`,
      required_artifact_type: "POSTING",
    });

    // user1がポスティング達成（10枚 = 500XP）
    const achievementId1 = crypto.randomUUID();
    const artifactId1 = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: achievementId1,
      mission_id: postingMissionId,
      user_id: user1.user.userId,
    });
    await adminClient.from("mission_artifacts").insert({
      id: artifactId1,
      achievement_id: achievementId1,
      user_id: user1.user.userId,
      artifact_type: "POSTING",
    });
    await adminClient.from("posting_activities").insert({
      id: crypto.randomUUID(),
      mission_artifact_id: artifactId1,
      location_text: "テスト場所1",
      posting_count: 10,
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 500, // 10枚 × 50XP
      source_type: "BONUS",
      source_id: achievementId1,
    });

    // user2がポスティング達成（20枚 = 1000XP）
    const achievementId2 = crypto.randomUUID();
    const artifactId2 = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: achievementId2,
      mission_id: postingMissionId,
      user_id: user2.user.userId,
    });
    await adminClient.from("mission_artifacts").insert({
      id: artifactId2,
      achievement_id: achievementId2,
      user_id: user2.user.userId,
      artifact_type: "POSTING",
    });
    await adminClient.from("posting_activities").insert({
      id: crypto.randomUUID(),
      mission_artifact_id: artifactId2,
      location_text: "テスト場所2",
      posting_count: 20,
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user2.user.userId,
      xp_amount: 1000, // 20枚 × 50XP
      source_type: "BONUS",
      source_id: achievementId2,
    });

    // ランキングを取得
    const { data, error } = await adminClient.rpc(
      "get_period_mission_ranking",
      {
        p_mission_id: postingMissionId,
        p_limit: 10,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(2);

    // user2が1位（1000XP）
    expect(data?.[0].user_name).toBe("ユーザー2");
    expect(data?.[0].total_points).toBe(1000);
    expect(data?.[0].rank).toBe(1);

    // user1が2位（500XP）
    expect(data?.[1].user_name).toBe("ユーザー1");
    expect(data?.[1].total_points).toBe(500);
    expect(data?.[1].rank).toBe(2);

    // クリーンアップ
    await adminClient
      .from("xp_transactions")
      .delete()
      .eq("source_id", achievementId1);
    await adminClient
      .from("xp_transactions")
      .delete()
      .eq("source_id", achievementId2);
    await adminClient
      .from("posting_activities")
      .delete()
      .eq("mission_artifact_id", artifactId1);
    await adminClient
      .from("posting_activities")
      .delete()
      .eq("mission_artifact_id", artifactId2);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("achievement_id", achievementId1);
    await adminClient
      .from("mission_artifacts")
      .delete()
      .eq("achievement_id", achievementId2);
    await adminClient
      .from("achievements")
      .delete()
      .eq("mission_id", postingMissionId);
    await adminClient.from("missions").delete().eq("id", postingMissionId);
  });

  test("異なるXP値のミッションでtotal_pointsが正しく計算される", async () => {
    // 異なるXP値（50XP）のミッションを作成
    const mission50xpId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: mission50xpId,
      title: "50XPミッション",
      content: "テスト",
      difficulty: 1,
      slug: `test-50xp-${crypto.randomUUID()}`,
    });

    // user1が50XPミッションを達成
    const achievementId = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: achievementId,
      mission_id: mission50xpId,
      user_id: user1.user.userId,
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 50,
      source_type: "MISSION_COMPLETION",
      source_id: achievementId,
    });

    // ランキングを取得
    const { data, error } = await adminClient.rpc(
      "get_period_mission_ranking",
      {
        p_mission_id: mission50xpId,
        p_limit: 10,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].total_points).toBe(50);

    // クリーンアップ
    await adminClient
      .from("xp_transactions")
      .delete()
      .eq("source_id", achievementId);
    await adminClient
      .from("achievements")
      .delete()
      .eq("mission_id", mission50xpId);
    await adminClient.from("missions").delete().eq("id", mission50xpId);
  });

  test("期間指定でフィルタリングが正しく動作する", async () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // 2時間前の達成記録を作成
    const oldAchievementId = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: oldAchievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
      created_at: twoHoursAgo.toISOString(),
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user1.user.userId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      source_id: oldAchievementId,
    });

    // 現在の達成記録を作成
    const newAchievementId = crypto.randomUUID();
    await adminClient.from("achievements").insert({
      id: newAchievementId,
      mission_id: missionId,
      user_id: user2.user.userId,
      created_at: now.toISOString(),
    });
    await adminClient.from("xp_transactions").insert({
      id: crypto.randomUUID(),
      user_id: user2.user.userId,
      xp_amount: 100,
      source_type: "MISSION_COMPLETION",
      source_id: newAchievementId,
    });

    // 1時間前以降のランキングを取得（user2のみが含まれる）
    const { data, error } = await adminClient.rpc(
      "get_period_mission_ranking",
      {
        p_mission_id: missionId,
        p_limit: 10,
        p_start_date: oneHourAgo.toISOString(),
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_name).toBe("ユーザー2");
  });
});

describe("get_user_period_mission_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;

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
      .eq("source_type", "MISSION_COMPLETION");
    await adminClient.from("achievements").delete().eq("mission_id", missionId);
    await adminClient.from("missions").delete().eq("id", missionId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("特定ユーザーのランキング情報を正しく取得できる", async () => {
    // user1: 100XP（2位になる）
    const achievementId1 = crypto.randomUUID();
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

    // user2: 200XP（1位になる）
    const achievementId2a = crypto.randomUUID();
    const achievementId2b = crypto.randomUUID();
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

    // user1のランキング情報を取得
    const { data, error } = await adminClient.rpc(
      "get_user_period_mission_ranking",
      {
        p_mission_id: missionId,
        p_user_id: user1.user.userId,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_name).toBe("ユーザー1");
    expect(data?.[0].total_points).toBe(100);
    expect(data?.[0].rank).toBe(2); // user2が1位なのでuser1は2位
  });
});
