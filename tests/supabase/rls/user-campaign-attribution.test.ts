import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "../utils";

describe("user_campaign_attribution テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テストデータを作成（service role で）
    const { error } = await adminClient
      .from("user_campaign_attribution")
      .insert([
        { user_id: user1.user.userId, campaign_code: "test-campaign-0730" },
        { user_id: user2.user.userId, campaign_code: "test-campaign-0801" },
      ]);
    if (error) {
      throw new Error(`テストデータ作成エラー: ${error.message}`);
    }
  });

  afterEach(async () => {
    await adminClient
      .from("user_campaign_attribution")
      .delete()
      .eq("user_id", user1.user.userId);
    await adminClient
      .from("user_campaign_attribution")
      .delete()
      .eq("user_id", user2.user.userId);

    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはuser_campaign_attributionを読み取れない", async () => {
    const anonClient = getAnonClient();
    const { data } = await anonClient
      .from("user_campaign_attribution")
      .select("*");

    expect(data).toEqual([]);
  });

  test("認証済みユーザーは自分のキャンペーンコードを読み取れる", async () => {
    const { data, error } = await user1.client
      .from("user_campaign_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0].campaign_code).toBe("test-campaign-0730");
  });

  test("認証済みユーザーは他のユーザーのキャンペーンコードを読み取れない", async () => {
    const { data, error } = await user1.client
      .from("user_campaign_attribution")
      .select("*")
      .eq("user_id", user2.user.userId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  test("認証済みユーザーは自分のキャンペーンコードをINSERTできない（保存はサーバー側のservice roleのみ）", async () => {
    // 事前に自分の行を削除しておき、INSERTがRLSで弾かれることを確認する
    await adminClient
      .from("user_campaign_attribution")
      .delete()
      .eq("user_id", user1.user.userId);

    const { error } = await user1.client
      .from("user_campaign_attribution")
      .insert({
        user_id: user1.user.userId,
        campaign_code: "test-campaign-hack",
      });

    expect(error).toBeTruthy();

    const { data: after } = await adminClient
      .from("user_campaign_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after).toEqual([]);
  });

  test("認証済みユーザーは自分のキャンペーンコードをUPDATEできない", async () => {
    await user1.client
      .from("user_campaign_attribution")
      .update({ campaign_code: "test-campaign-changed" })
      .eq("user_id", user1.user.userId);

    const { data: after } = await adminClient
      .from("user_campaign_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after?.[0].campaign_code).toBe("test-campaign-0730");
  });

  test("認証済みユーザーは自分のキャンペーンコードをDELETEできない", async () => {
    await user1.client
      .from("user_campaign_attribution")
      .delete()
      .eq("user_id", user1.user.userId);

    const { data: after } = await adminClient
      .from("user_campaign_attribution")
      .select("*")
      .eq("user_id", user1.user.userId);
    expect(after).toHaveLength(1);
  });
});
