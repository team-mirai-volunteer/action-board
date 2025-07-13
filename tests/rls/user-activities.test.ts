/**
 * user_activitiesテーブルのRow Level Security (RLS) テスト
 * 
 * このテストファイルは以下の重要なセキュリティポリシーを検証します：
 * - 認証済みユーザーが自分の活動のみ挿入可能
 * - 他のユーザーの活動は挿入不可
 * - 匿名ユーザーは活動を挿入不可
 * - 全てのユーザーが活動を読み取り可能（公開データ）
 * - 複数の活動タイプが正しく処理される
 */
import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("user_activities テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);
  });

  afterEach(async () => {
    await adminClient.from("user_activities").delete().eq("user_id", user1.user.userId);
    await adminClient.from("user_activities").delete().eq("user_id", user2.user.userId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("認証済みユーザーは自分のアクティビティを挿入可能", async () => {
    const activityId = crypto.randomUUID();
    const { data, error } = await user1.client
      .from("user_activities")
      .insert({
        id: activityId,
        user_id: user1.user.userId,
        activity_type: "signup",
        activity_title: "新規登録しました",
      })
      .select();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.[0]?.id).toBe(activityId);
    expect(data?.[0]?.user_id).toBe(user1.user.userId);
  });

  test("他ユーザーのアクティビティは挿入不可", async () => {
    const activityId = crypto.randomUUID();
    const { data, error } = await user1.client.from("user_activities").insert({
      id: activityId,
      user_id: user2.user.userId,
      activity_type: "signup",
      activity_title: "不正な登録試行",
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("匿名ユーザーはアクティビティを挿入不可", async () => {
    const anonClient = getAnonClient();
    const activityId = crypto.randomUUID();

    const { data, error } = await anonClient.from("user_activities").insert({
      id: activityId,
      user_id: user1.user.userId,
      activity_type: "signup",
      activity_title: "匿名ユーザーからの試行",
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("全ユーザーが全アクティビティを読み取り可能", async () => {
    const activityId = crypto.randomUUID();
    await user1.client.from("user_activities").insert({
      id: activityId,
      user_id: user1.user.userId,
      activity_type: "level_up",
      activity_title: "レベルアップしました",
    });

    const { data: user2Data, error: user2Error } = await user2.client
      .from("user_activities")
      .select("*")
      .eq("id", activityId)
      .single();

    expect(user2Error).toBeNull();
    expect(user2Data?.id).toBe(activityId);
    expect(user2Data?.user_id).toBe(user1.user.userId);

    const anonClient = getAnonClient();
    const { data: anonData, error: anonError } = await anonClient
      .from("user_activities")
      .select("*")
      .eq("id", activityId)
      .single();

    expect(anonError).toBeNull();
    expect(anonData?.id).toBe(activityId);
    expect(anonData?.user_id).toBe(user1.user.userId);
  });

  test("複数のアクティビティタイプが正しく処理される", async () => {
    const activities = [
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        activity_type: "signup",
        activity_title: "新規登録しました",
      },
      {
        id: crypto.randomUUID(),
        user_id: user1.user.userId,
        activity_type: "level_up",
        activity_title: "レベル2になりました",
      },
    ];

    for (const activity of activities) {
      const { error } = await user1.client
        .from("user_activities")
        .insert(activity);
      expect(error).toBeNull();
    }

    const { data, error } = await user1.client
      .from("user_activities")
      .select("*")
      .eq("user_id", user1.user.userId)
      .order("created_at", { ascending: false });

    expect(error).toBeNull();
    expect(data).toHaveLength(2);
    expect(data?.map(a => a.activity_type)).toContain("signup");
    expect(data?.map(a => a.activity_type)).toContain("level_up");
  });
});
