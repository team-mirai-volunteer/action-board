import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("achievements テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用ミッションを作成（管理者権限で）
    const missionData = {
      id: crypto.randomUUID(),
      title: "テストミッション",
      content: "これはテスト用のミッションです",
      difficulty: 1,
      slug: `test-mission-${crypto.randomUUID()}`,
    };

    const { error } = await adminClient.from("missions").insert(missionData);
    if (error) throw new Error(`ミッション作成エラー: ${error.message}`);

    missionId = missionData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient.from("achievements").delete().eq("mission_id", missionId);
    await adminClient.from("missions").delete().eq("id", missionId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("認証済みユーザーは自分のミッション達成記録を作成できる", async () => {
    const achievementId = crypto.randomUUID();
    const { data, error } = await user1.client
      .from("achievements")
      .insert({
        id: achievementId,
        mission_id: missionId,
        user_id: user1.user.userId,
      })
      .select();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.[0]?.id).toBe(achievementId);
  });

  test("認証済みユーザーは他のユーザーのミッション達成記録を作成できない", async () => {
    const achievementId = crypto.randomUUID();
    const { data, error } = await user1.client.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user2.user.userId, // 別ユーザーのIDを使用
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("匿名ユーザーはミッション達成記録を作成できない", async () => {
    const anonClient = getAnonClient();
    const achievementId = crypto.randomUUID();

    const { data, error } = await anonClient.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("すべてのユーザーはすべてのミッション達成記録を読み取れる", async () => {
    // まずuser1が達成記録を作成
    const achievementId = crypto.randomUUID();
    await user1.client.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    // user2がその達成記録を読み取れるか確認
    const { data: user2Data, error: user2Error } = await user2.client
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single();

    expect(user2Error).toBeNull();
    expect(user2Data?.id).toBe(achievementId);
    expect(user2Data?.user_id).toBe(user1.user.userId);

    // 匿名ユーザーも達成記録を読み取れるか確認
    const anonClient = getAnonClient();
    const { data: anonData, error: anonError } = await anonClient
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single();

    expect(anonError).toBeNull();
    expect(anonData?.id).toBe(achievementId);
    expect(anonData?.user_id).toBe(user1.user.userId);
  });

  test("認証済みユーザーは自分のミッション達成記録を削除できる", async () => {
    // まずuser1が達成記録を作成
    const achievementId = crypto.randomUUID();
    await user1.client.from("achievements").insert({
      id: achievementId,
      mission_id: missionId,
      user_id: user1.user.userId,
    });

    // 自分の達成記録を削除しようとする
    const { error: deleteError } = await user1.client
      .from("achievements")
      .delete()
      .eq("id", achievementId);

    expect(deleteError).toBeNull();

    // 本当に削除されていないか確認
    const { data: checkData, error } = await adminClient
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single();

    expect(error).toBeTruthy();
    expect(checkData).toBeNull();
  });
});
