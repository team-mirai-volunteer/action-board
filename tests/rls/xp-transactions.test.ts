import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("xp_transactions テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let user2: Awaited<ReturnType<typeof createTestUser>>;
  let missionId: string;
  let transaction1Id: string;
  let transaction2Id: string;

  beforeEach(async () => {
    // テストユーザーを2人作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    user2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用ミッションを作成
    missionId = crypto.randomUUID();
    const { error: missionError } = await adminClient.from("missions").insert({
      id: missionId,
      title: "XPテスト用ミッション",
      content: "XP取引テスト用",
      difficulty: 2,
    });

    if (missionError) {
      throw new Error(`ミッション作成エラー: ${missionError.message}`);
    }

    // テスト用のxp_transactionsデータを作成（管理者権限で）
    transaction1Id = crypto.randomUUID();
    transaction2Id = crypto.randomUUID();

    const { error: tx1Error } = await adminClient
      .from("xp_transactions")
      .insert({
        id: transaction1Id,
        user_id: user1.user.userId,
        xp_amount: 50,
        source_type: "MISSION_COMPLETION",
        source_id: missionId,
        description: "ミッション完了による獲得",
      });

    const { error: tx2Error } = await adminClient
      .from("xp_transactions")
      .insert({
        id: transaction2Id,
        user_id: user2.user.userId,
        xp_amount: 30,
        source_type: "BONUS",
        source_id: null,
        description: "ボーナスXP",
      });

    if (tx1Error) {
      throw new Error(`transaction1作成エラー: ${tx1Error.message}`);
    }
    if (tx2Error) {
      throw new Error(`transaction2作成エラー: ${tx2Error.message}`);
    }
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient.from("xp_transactions").delete().eq("id", transaction1Id);
    await adminClient.from("xp_transactions").delete().eq("id", transaction2Id);
    await adminClient.from("missions").delete().eq("id", missionId);
    await cleanupTestUser(user1.user.userId);
    await cleanupTestUser(user2.user.userId);
  });

  test("匿名ユーザーはxp_transactionsを読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient
      .from("xp_transactions")
      .select("*");

    // 匿名ユーザーはアクセスできる
    expect(error).toBeNull();
    expect(data).toBeTruthy();
  });

  test("認証済みユーザーはXP履歴を更新できない", async () => {
    await user1.client
      .from("xp_transactions")
      .update({
        xp_amount: 100,
        description: "更新されたXP",
      })
      .eq("id", transaction1Id);

    // XP履歴は不変であるべき
    const { data, error } = await user1.client
      .from("xp_transactions")
      .select("*")
      .eq("id", transaction1Id);
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.[0].xp_amount).toBe(50); // 更新されていない
    expect(data?.[0].description).toBe("ミッション完了による獲得"); // 更新されていない
  });

  test("認証済みユーザーは自分のXP履歴でも削除できない", async () => {
    await user1.client
      .from("xp_transactions")
      .delete()
      .eq("id", transaction1Id);

    // XP履歴は削除できない（監査証跡として保持）
    const { data, error } = await user1.client
      .from("xp_transactions")
      .select("*")
      .eq("id", transaction1Id);
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(1); // 削除されていない
    expect(data?.[0].id).toBe(transaction1Id); // 元のIDが残っている
    expect(data?.[0].xp_amount).toBe(50); // 元のXP量が残っている
    expect(data?.[0].source_type).toBe("MISSION_COMPLETION"); // 元のソースタイプが残っている
    expect(data?.[0].source_id).toBe(missionId); // 元のソースIDが残っている
    expect(data?.[0].description).toBe("ミッション完了による獲得"); // 元の説明が残っている
  });

  test("認証済みユーザーはxp_transactionsにINSERTできない", async () => {
    const { error } = await user1.client.from("xp_transactions").insert({
      user_id: user1.user.userId,
      xp_amount: 25,
      source_type: "BONUS",
      description: "手動追加XP",
    });

    // 一般ユーザーは直接XP履歴を作成できない（サービス層で制御される）
    expect(error).toBeTruthy();
  });

  test("XP履歴をソート順で取得できる", async () => {
    // user1に追加のトランザクションを作成
    const additionalTxId = crypto.randomUUID();
    await adminClient.from("xp_transactions").insert({
      id: additionalTxId,
      user_id: user1.user.userId,
      xp_amount: -10,
      source_type: "PENALTY",
      description: "ペナルティXP",
    });

    const { data, error } = await user1.client
      .from("xp_transactions")
      .select("*")
      .eq("user_id", user1.user.userId)
      .order("created_at", { ascending: false });

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(2);

    // 作成日時の降順でソートされているか確認
    expect(data?.[0].created_at).toBeDefined();
    expect(data?.[1].created_at).toBeDefined();

    const firstDate = data?.[0].created_at;
    const secondDate = data?.[1].created_at;

    if (firstDate && secondDate) {
      expect(new Date(firstDate).getTime()).toBeGreaterThanOrEqual(
        new Date(secondDate).getTime(),
      );
    }

    // クリーンアップ
    await adminClient.from("xp_transactions").delete().eq("id", additionalTxId);
  });

  test("特定のソースタイプでXP履歴をフィルタできる", async () => {
    // user1にボーナスXPも追加
    const bonusTxId = crypto.randomUUID();
    await adminClient.from("xp_transactions").insert({
      id: bonusTxId,
      user_id: user1.user.userId,
      xp_amount: 20,
      source_type: "BONUS",
      description: "ボーナスXP",
    });

    const { data, error } = await user1.client
      .from("xp_transactions")
      .select("*")
      .eq("user_id", user1.user.userId)
      .eq("source_type", "MISSION_COMPLETION");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data).toHaveLength(1);
    expect(data?.[0].source_type).toBe("MISSION_COMPLETION");

    // クリーンアップ
    await adminClient.from("xp_transactions").delete().eq("id", bonusTxId);
  });
});
