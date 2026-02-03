import { adminClient, cleanupTestUser, createTestUser } from "../utils";

describe("get_prefecture_team_ranking 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let user3: Awaited<ReturnType<typeof createTestUser>>;
  let overseasUser: Awaited<ReturnType<typeof createTestUser>>;
  let seasonId: string;
  let prefectureA: string;
  let prefectureB: string;
  const createPrefecture = (prefix: string) =>
    `${prefix}${crypto.randomUUID().replace(/-/g, "").slice(0, 3)}`;
  const updatePrefecture = async (
    userId: string,
    name: string,
    prefecture: string,
  ) => {
    const { data, error } = await adminClient
      .from("public_user_profiles")
      .update({ name, address_prefecture: prefecture })
      .eq("id", userId)
      .select("id, address_prefecture")
      .single();
    if (error) {
      throw new Error(`プロフィール更新に失敗しました: ${error.message}`);
    }
    if (data?.address_prefecture !== prefecture) {
      throw new Error(
        `プロフィール更新が反映されていません: expected=${prefecture} actual=${data?.address_prefecture}`,
      );
    }
  };

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user3 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    overseasUser = await createTestUser(`${crypto.randomUUID()}@example.com`);

    prefectureA = createPrefecture("A");
    prefectureB = createPrefecture("B");

    await updatePrefecture(user1.user.userId, "ユーザー1", prefectureA);
    await updatePrefecture(user2.user.userId, "ユーザー2", prefectureA);
    await updatePrefecture(user3.user.userId, "ユーザー3", prefectureB);
    await updatePrefecture(overseasUser.user.userId, "海外ユーザー", "海外");

    seasonId = crypto.randomUUID();
    await adminClient.from("seasons").insert({
      id: seasonId,
      slug: `test-season-${crypto.randomUUID()}`,
      name: "テストシーズン",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: false,
    });

    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        season_id: seasonId,
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 300,
        source_type: "MISSION_COMPLETION",
      },
      {
        id: crypto.randomUUID(),
        user_id: user3.user.userId,
        xp_amount: 200,
        source_type: "MISSION_COMPLETION",
        season_id: seasonId,
      },
      {
        id: crypto.randomUUID(),
        user_id: overseasUser.user.userId,
        xp_amount: 999,
        source_type: "MISSION_COMPLETION",
        season_id: seasonId,
      },
    ]);
  });

  afterEach(async () => {
    await adminClient
      .from("xp_transactions")
      .delete()
      .in("user_id", [
        user1.user.userId,
        user2.user.userId,
        user3.user.userId,
        overseasUser.user.userId,
      ]);
    await adminClient.from("seasons").delete().eq("id", seasonId);

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
    await cleanupTestUser(user3.user.userId);
    await cleanupTestUser(overseasUser.user.userId);
  });

  test("シーズン指定で集計され、海外は除外される", async () => {
    const { data, error } = await adminClient.rpc(
      "get_prefecture_team_ranking",
      {
        p_season_id: seasonId,
        p_limit: 10,
      },
    );

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    const osaka = (data ?? []).find(
      (d: { prefecture: string }) => d.prefecture === prefectureA,
    );
    const tokyo = (data ?? []).find(
      (d: { prefecture: string }) => d.prefecture === prefectureB,
    );
    const hasOverseas = (data ?? []).some(
      (d: { prefecture: string }) => d.prefecture === "海外",
    );

    expect(hasOverseas).toBe(false);
    expect(osaka?.total_xp).toBe(100);
    expect(osaka?.user_count).toBe(1);
    expect(tokyo?.total_xp).toBe(200);
    expect(tokyo?.user_count).toBe(1);
  });

  test("シーズン指定なしで全期間の集計が返る", async () => {
    const { data, error } = await adminClient.rpc(
      "get_prefecture_team_ranking",
      {
        p_limit: 10,
      },
    );

    expect(error).toBeNull();
    expect(data).not.toBeNull();

    const osaka = (data ?? []).find(
      (d: { prefecture: string }) => d.prefecture === prefectureA,
    );
    const tokyo = (data ?? []).find(
      (d: { prefecture: string }) => d.prefecture === prefectureB,
    );

    expect(osaka?.total_xp).toBe(400);
    expect(osaka?.user_count).toBe(2);
    expect(tokyo?.total_xp).toBe(200);
    expect(tokyo?.user_count).toBe(1);
  });

  test("p_limitで結果件数が制限される", async () => {
    const { data, error } = await adminClient.rpc(
      "get_prefecture_team_ranking",
      {
        p_limit: 1,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });
});

describe("get_user_prefecture_contribution 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let overseasUser: Awaited<ReturnType<typeof createTestUser>>;
  let seasonId: string;
  let prefecture: string;
  const createPrefecture = (prefix: string) =>
    `${prefix}${crypto.randomUUID().replace(/-/g, "").slice(0, 3)}`;
  const updatePrefecture = async (
    userId: string,
    name: string,
    targetPrefecture: string,
  ) => {
    const { data, error } = await adminClient
      .from("public_user_profiles")
      .update({ name, address_prefecture: targetPrefecture })
      .eq("id", userId)
      .select("id, address_prefecture")
      .single();
    if (error) {
      throw new Error(`プロフィール更新に失敗しました: ${error.message}`);
    }
    if (data?.address_prefecture !== targetPrefecture) {
      throw new Error(
        `プロフィール更新が反映されていません: expected=${targetPrefecture} actual=${data?.address_prefecture}`,
      );
    }
  };

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    overseasUser = await createTestUser(`${crypto.randomUUID()}@example.com`);

    prefecture = createPrefecture("C");

    await updatePrefecture(user1.user.userId, "ユーザー1", prefecture);
    await updatePrefecture(user2.user.userId, "ユーザー2", prefecture);
    await updatePrefecture(overseasUser.user.userId, "海外ユーザー", "海外");

    seasonId = crypto.randomUUID();
    await adminClient.from("seasons").insert({
      id: seasonId,
      slug: `test-season-${crypto.randomUUID()}`,
      name: "テストシーズン",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: false,
    });

    await adminClient.from("xp_transactions").insert([
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        xp_amount: 100,
        source_type: "MISSION_COMPLETION",
        season_id: seasonId,
      },
      {
        id: crypto.randomUUID(),
        user_id: user2.user.userId,
        xp_amount: 300,
        source_type: "MISSION_COMPLETION",
        season_id: seasonId,
      },
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        xp_amount: 50,
        source_type: "MISSION_COMPLETION",
      },
      {
        id: crypto.randomUUID(),
        user_id: overseasUser.user.userId,
        xp_amount: 999,
        source_type: "MISSION_COMPLETION",
        season_id: seasonId,
      },
    ]);
  });

  afterEach(async () => {
    await adminClient
      .from("xp_transactions")
      .delete()
      .in("user_id", [
        user1.user.userId,
        user2.user.userId,
        overseasUser.user.userId,
      ]);
    await adminClient.from("seasons").delete().eq("id", seasonId);

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
    await cleanupTestUser(overseasUser.user.userId);
  });

  test("シーズン指定でユーザー貢献度が正しく返される", async () => {
    const { data, error } = await adminClient.rpc(
      "get_user_prefecture_contribution",
      {
        p_user_id: user1.user.userId,
        p_season_id: seasonId,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].prefecture).toBe(prefecture);
    expect(data?.[0].user_xp).toBe(100);
    expect(data?.[0].prefecture_total_xp).toBe(400);
    expect(data?.[0].user_rank_in_prefecture).toBe(2);
  });

  test("シーズン指定なしで全期間集計が返される", async () => {
    const { data, error } = await adminClient.rpc(
      "get_user_prefecture_contribution",
      {
        p_user_id: user1.user.userId,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].user_xp).toBe(150);
    expect(data?.[0].prefecture_total_xp).toBe(450);
    expect(data?.[0].user_rank_in_prefecture).toBe(2);
  });

  test("海外ユーザーは結果が返らない", async () => {
    const { data, error } = await adminClient.rpc(
      "get_user_prefecture_contribution",
      {
        p_user_id: overseasUser.user.userId,
        p_season_id: seasonId,
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });
});
