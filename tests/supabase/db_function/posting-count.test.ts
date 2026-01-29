import { adminClient, cleanupTestUser, createTestUser } from "../utils";

describe("get_user_posting_count 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  const createdAchievementIds: string[] = [];
  const createdArtifactIds: string[] = [];

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    missionId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: missionId,
      title: "ポスティングミッション",
      content: "テスト",
      difficulty: 1,
      slug: `test-posting-${crypto.randomUUID()}`,
      required_artifact_type: "POSTING",
    });
  });

  afterEach(async () => {
    if (createdArtifactIds.length > 0) {
      await adminClient
        .from("posting_activities")
        .delete()
        .in("mission_artifact_id", createdArtifactIds);
      await adminClient
        .from("mission_artifacts")
        .delete()
        .in("id", createdArtifactIds);
    }
    if (createdAchievementIds.length > 0) {
      await adminClient
        .from("achievements")
        .delete()
        .in("id", createdAchievementIds);
    }
    await adminClient.from("missions").delete().eq("id", missionId);

    createdAchievementIds.length = 0;
    createdArtifactIds.length = 0;

    await cleanupTestUser(user1.user.userId);
  });

  test("ユーザーの投稿数合計を正しく取得できる", async () => {
    // achievementを作成
    const achievementId = crypto.randomUUID();
    createdAchievementIds.push(achievementId);
    await adminClient.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    // mission_artifactを作成
    const artifactId = crypto.randomUUID();
    createdArtifactIds.push(artifactId);
    await adminClient.from("mission_artifacts").insert({
      id: artifactId,
      achievement_id: achievementId,
      user_id: user1.user.userId,
      artifact_type: "POSTING",
    });

    // posting_activityを作成（10枚）
    await adminClient.from("posting_activities").insert({
      id: crypto.randomUUID(),
      mission_artifact_id: artifactId,
      location_text: "テスト場所",
      posting_count: 10,
    });

    const { data, error } = await adminClient.rpc("get_user_posting_count", {
      target_user_id: user1.user.userId,
    });

    expect(error).toBeNull();
    expect(data).toBe(10);
  });

  test("複数のポスティング活動の合計が正しく計算される", async () => {
    // 2つのachievementを作成
    const achievementId1 = crypto.randomUUID();
    const achievementId2 = crypto.randomUUID();
    createdAchievementIds.push(achievementId1, achievementId2);
    await adminClient.from("achievements").insert([
      {
        id: achievementId1,
        mission_id: missionId,
        user_id: user1.user.userId,
      },
      {
        id: achievementId2,
        mission_id: missionId,
        user_id: user1.user.userId,
      },
    ]);

    const artifactId1 = crypto.randomUUID();
    const artifactId2 = crypto.randomUUID();
    createdArtifactIds.push(artifactId1, artifactId2);
    await adminClient.from("mission_artifacts").insert([
      {
        id: artifactId1,
        achievement_id: achievementId1,
        user_id: user1.user.userId,
        artifact_type: "POSTING",
      },
      {
        id: artifactId2,
        achievement_id: achievementId2,
        user_id: user1.user.userId,
        artifact_type: "POSTING",
      },
    ]);

    await adminClient.from("posting_activities").insert([
      {
        id: crypto.randomUUID(),
        mission_artifact_id: artifactId1,
        location_text: "場所1",
        posting_count: 10,
      },
      {
        id: crypto.randomUUID(),
        mission_artifact_id: artifactId2,
        location_text: "場所2",
        posting_count: 20,
      },
    ]);

    const { data, error } = await adminClient.rpc("get_user_posting_count", {
      target_user_id: user1.user.userId,
    });

    expect(error).toBeNull();
    expect(data).toBe(30);
  });

  test("投稿活動がないユーザーは0を返す", async () => {
    const { data, error } = await adminClient.rpc("get_user_posting_count", {
      target_user_id: user1.user.userId,
    });

    expect(error).toBeNull();
    expect(data).toBe(0);
  });
});

describe("get_top_users_posting_count 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  const createdAchievementIds: string[] = [];
  const createdArtifactIds: string[] = [];

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    missionId = crypto.randomUUID();
    await adminClient.from("missions").insert({
      id: missionId,
      title: "ポスティングミッション",
      content: "テスト",
      difficulty: 1,
      slug: `test-posting-${crypto.randomUUID()}`,
      required_artifact_type: "POSTING",
    });
  });

  afterEach(async () => {
    if (createdArtifactIds.length > 0) {
      await adminClient
        .from("posting_activities")
        .delete()
        .in("mission_artifact_id", createdArtifactIds);
      await adminClient
        .from("mission_artifacts")
        .delete()
        .in("id", createdArtifactIds);
    }
    if (createdAchievementIds.length > 0) {
      await adminClient
        .from("achievements")
        .delete()
        .in("id", createdAchievementIds);
    }
    await adminClient.from("missions").delete().eq("id", missionId);

    createdAchievementIds.length = 0;
    createdArtifactIds.length = 0;

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("複数ユーザーの投稿数を一括取得できる", async () => {
    // user1: 15枚、user2: 25枚
    for (const { user, count } of [
      { user: user1, count: 15 },
      { user: user2, count: 25 },
    ]) {
      const achievementId = crypto.randomUUID();
      createdAchievementIds.push(achievementId);
      await adminClient.from("achievements").insert({
        id: achievementId,
        mission_id: missionId,
        user_id: user.user.userId,
      });
      const artifactId = crypto.randomUUID();
      createdArtifactIds.push(artifactId);
      await adminClient.from("mission_artifacts").insert({
        id: artifactId,
        achievement_id: achievementId,
        user_id: user.user.userId,
        artifact_type: "POSTING",
      });
      await adminClient.from("posting_activities").insert({
        id: crypto.randomUUID(),
        mission_artifact_id: artifactId,
        location_text: "テスト場所",
        posting_count: count,
      });
    }

    const { data, error } = await adminClient.rpc(
      "get_top_users_posting_count",
      {
        user_ids: [user1.user.userId, user2.user.userId],
      },
    );

    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data?.length).toBeGreaterThanOrEqual(2);

    // 投稿数降順でソートされている
    const user1Data = data?.find(
      (d: { user_id: string }) => d.user_id === user1.user.userId,
    );
    const user2Data = data?.find(
      (d: { user_id: string }) => d.user_id === user2.user.userId,
    );
    expect(user1Data?.posting_count).toBe(15);
    expect(user2Data?.posting_count).toBe(25);
  });

  test("投稿数が1以下のユーザーは結果に含まれない", async () => {
    // user1: 1枚（HAVING > 1 で除外される）
    const achievementId = crypto.randomUUID();
    createdAchievementIds.push(achievementId);
    await adminClient.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
    });
    const artifactId = crypto.randomUUID();
    createdArtifactIds.push(artifactId);
    await adminClient.from("mission_artifacts").insert({
      id: artifactId,
      achievement_id: achievementId,
      user_id: user1.user.userId,
      artifact_type: "POSTING",
    });
    await adminClient.from("posting_activities").insert({
      id: crypto.randomUUID(),
      mission_artifact_id: artifactId,
      location_text: "テスト場所",
      posting_count: 1,
    });

    const { data, error } = await adminClient.rpc(
      "get_top_users_posting_count",
      {
        user_ids: [user1.user.userId],
      },
    );

    expect(error).toBeNull();
    // HAVING > 1 で除外されるため空
    const user1Data = data?.find(
      (d: { user_id: string }) => d.user_id === user1.user.userId,
    );
    expect(user1Data).toBeUndefined();
  });
});
