import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "../utils";

describe("user_venue_attribution テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テストデータを作成（service role で）
    const { error } = await adminClient.from("user_venue_attribution").insert([
      { user_id: user1.user.userId, venue_code: "test-venue-0730" },
      { user_id: user2.user.userId, venue_code: "test-venue-0801" },
    ]);
    if (error) {
      throw new Error(`テストデータ作成エラー: ${error.message}`);
    }
  });

  afterEach(async () => {
    await adminClient
      .from("user_venue_attribution")
      .delete()
      .eq("user_id", user1.user.userId);
    await adminClient
      .from("user_venue_attribution")
      .delete()
      .eq("user_id", user2.user.userId);

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはuser_venue_attributionを読み取れない", async () => {
    const anonClient = getAnonClient();
    const { data } = await anonClient
      .from("user_venue_attribution")
      .select("*");

    expect(data).toEqual([]);
  });

  test("認証済みユーザーは自分の会場コードを読み取れる", async () => {
    const { data, error } = await user1.client
      .from("user_venue_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].venue_code).toBe("test-venue-0730");
  });

  test("認証済みユーザーは他のユーザーの会場コードを読み取れない", async () => {
    const { data, error } = await user1.client
      .from("user_venue_attribution")
      .select("*")
      .eq("user_id", user2.user.userId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("認証済みユーザーは自分の会場コードをINSERTできない（保存はサーバー側のservice roleのみ）", async () => {
    // 事前に自分の行を削除しておき、INSERTがRLSで弾かれることを確認する
    await adminClient
      .from("user_venue_attribution")
      .delete()
      .eq("user_id", user1.user.userId);

    const { error } = await user1.client.from("user_venue_attribution").insert({
      user_id: user1.user.userId,
      venue_code: "test-venue-hack",
    });

    expect(error).toBeTruthy();

    const { data: after } = await adminClient
      .from("user_venue_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after).toEqual([]);
  });

  test("認証済みユーザーは自分の会場コードをUPDATEできない", async () => {
    await user1.client
      .from("user_venue_attribution")
      .update({ venue_code: "test-venue-changed" })
      .eq("user_id", user1.user.userId);

    const { data: after } = await adminClient
      .from("user_venue_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after?.[0].venue_code).toBe("test-venue-0730");
  });

  test("認証済みユーザーは自分の会場コードをDELETEできない", async () => {
    await user1.client
      .from("user_venue_attribution")
      .delete()
      .eq("user_id", user1.user.userId);

    const { data: after } = await adminClient
      .from("user_venue_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after).toHaveLength(1);
  });
});
