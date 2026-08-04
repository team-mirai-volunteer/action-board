import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "../utils";

// 他のテストが入れた行と混ざらないよう、実行ごとにユニークなプレフィックスで隔離する
const PREFIX = `stats${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
const SAPPORO = `${PREFIX}-sapporo-0730`;
const AOMORI = `${PREFIX}-aomori-0801`;

describe("get_campaign_attribution_stats 関数のテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let user3: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user3 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    const { error } = await adminClient
      .from("user_campaign_attribution")
      .insert([
        {
          user_id: user1.user.userId,
          campaign_code: SAPPORO,
          created_at: "2026-07-30T03:00:00+09:00",
        },
        {
          // created_at はマイクロ秒精度。「その日の 23:59:59.999 まで」と包含比較すると
          // 取りこぼす時刻をあえて置き、半開区間で拾えることを確かめる
          user_id: user2.user.userId,
          campaign_code: SAPPORO,
          created_at: "2026-07-30T23:59:59.999500+09:00",
        },
        {
          user_id: user3.user.userId,
          campaign_code: AOMORI,
          created_at: "2026-08-01T12:00:00+09:00",
        },
      ]);
    if (error) {
      throw new Error(`テストデータ作成エラー: ${error.message}`);
    }
  });

  afterEach(async () => {
    await adminClient
      .from("user_campaign_attribution")
      .delete()
      .in("user_id", [user1.user.userId, user2.user.userId, user3.user.userId]);

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
    await cleanupTestUser(user3.user.userId);
  });

  test("キャンペーンコード別に登録数と初回/最終登録日時を集計できる", async () => {
    const { data, error } = await adminClient.rpc(
      "get_campaign_attribution_stats",
      { campaign_code_prefix: PREFIX },
    );

    expect(error).toBeNull();
    // 登録数の多い順に並ぶ
    expect(data?.map((row) => row.campaign_code)).toEqual([SAPPORO, AOMORI]);

    const sapporo = data?.find((row) => row.campaign_code === SAPPORO);
    expect(Number(sapporo?.registrations)).toBe(2);
    expect(new Date(sapporo?.first_registered_at ?? "").toISOString()).toBe(
      "2026-07-29T18:00:00.000Z",
    );
    // マイクロ秒はJSのDateで丸めずに文字列で確認する
    expect(sapporo?.last_registered_at).toContain("2026-07-30T14:59:59.9995");
  });

  test("前方一致フィルタは大文字小文字を区別しない", async () => {
    const { data, error } = await adminClient.rpc(
      "get_campaign_attribution_stats",
      { campaign_code_prefix: PREFIX.toUpperCase() },
    );

    expect(error).toBeNull();
    expect(data?.map((row) => row.campaign_code).sort()).toEqual(
      [AOMORI, SAPPORO].sort(),
    );
  });

  test("前方一致フィルタで特定キャンペーンだけに絞れる", async () => {
    const { data, error } = await adminClient.rpc(
      "get_campaign_attribution_stats",
      { campaign_code_prefix: `${PREFIX}-aomori` },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].campaign_code).toBe(AOMORI);
    expect(Number(data?.[0].registrations)).toBe(1);
  });

  test("期間フィルタは半開区間で、その日の終わり際（サブミリ秒）も取りこぼさない", async () => {
    // 7/30 のみ（JST）→ 03:00 と 23:59:59.9995 の2件
    const { data, error } = await adminClient.rpc(
      "get_campaign_attribution_stats",
      {
        campaign_code_prefix: PREFIX,
        registered_from: "2026-07-30T00:00:00+09:00",
        registered_before: "2026-07-31T00:00:00+09:00",
      },
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].campaign_code).toBe(SAPPORO);
    expect(Number(data?.[0].registrations)).toBe(2);
  });

  test("上限は排他境界（指定時刻ぴったりの登録は含まない）", async () => {
    // 8/1 0時 JST より前 → 7/30 の2件だけ（8/1 12:00 の aomori は入らない）
    const { data, error } = await adminClient.rpc(
      "get_campaign_attribution_stats",
      {
        campaign_code_prefix: PREFIX,
        registered_before: "2026-08-01T00:00:00+09:00",
      },
    );

    expect(error).toBeNull();
    expect(data?.map((row) => row.campaign_code)).toEqual([SAPPORO]);
    expect(Number(data?.[0].registrations)).toBe(2);
  });

  test("該当がない期間では空配列を返す", async () => {
    const { data, error } = await adminClient.rpc(
      "get_campaign_attribution_stats",
      {
        campaign_code_prefix: PREFIX,
        registered_from: "2026-09-01T00:00:00+09:00",
      },
    );

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("匿名ユーザーは集計関数を実行できない", async () => {
    const anonClient = getAnonClient();
    const { error } = await anonClient.rpc("get_campaign_attribution_stats", {
      campaign_code_prefix: PREFIX,
    });

    expect(error).toBeTruthy();
  });

  test("認証済みユーザーも集計関数を実行できない", async () => {
    const { error } = await user1.client.rpc("get_campaign_attribution_stats", {
      campaign_code_prefix: PREFIX,
    });

    expect(error).toBeTruthy();
  });
});
