import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("elections テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let electionId: string;
  let seasonId: string;

  beforeEach(async () => {
    // テストユーザーを作成
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // テスト用シーズンを取得（既存のseason1を使用）
    const { data: seasonData } = await adminClient
      .from("seasons")
      .select("id")
      .eq("slug", "season1")
      .single();

    if (!seasonData) {
      throw new Error("season1が見つかりません");
    }
    seasonId = seasonData.id;

    // テスト用選挙を作成（管理者権限で）
    const electionData = {
      id: crypto.randomUUID(),
      season_id: seasonId,
      start_date: "2025-06-24T00:00:00+09:00",
      end_date: "2025-07-13T20:00:00+09:00",
      subject: "参院選" as const,
      lgcodes: [],
    };

    const { error } = await adminClient.from("elections").insert(electionData);
    if (error) throw new Error(`選挙作成エラー: ${error.message}`);

    electionId = electionData.id;
  });

  afterEach(async () => {
    // テストデータをクリーンアップ
    await adminClient.from("elections").delete().eq("id", electionId);
    await cleanupTestUser(user1.user.userId);
  });

  test("匿名ユーザーは選挙一覧を読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient.from("elections").select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.some((election) => election.id === electionId)).toBeTruthy();
  });

  test("認証済みユーザーは選挙一覧を読み取れる", async () => {
    const { data, error } = await user1.client.from("elections").select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.some((election) => election.id === electionId)).toBeTruthy();
  });

  test("匿名ユーザーは選挙を作成できない", async () => {
    const anonClient = getAnonClient();
    const newElectionId = crypto.randomUUID();

    const { data, error } = await anonClient.from("elections").insert({
      id: newElectionId,
      season_id: seasonId,
      start_date: "2026-01-01T00:00:00+09:00",
      end_date: "2026-01-31T23:59:59+09:00",
      subject: "衆院選",
      lgcodes: [],
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証済みユーザーは選挙を作成できない", async () => {
    const newElectionId = crypto.randomUUID();

    const { data, error } = await user1.client.from("elections").insert({
      id: newElectionId,
      season_id: seasonId,
      start_date: "2026-01-01T00:00:00+09:00",
      end_date: "2026-01-31T23:59:59+09:00",
      subject: "衆院選",
      lgcodes: [],
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証済みユーザーは選挙を更新できない", async () => {
    const { data } = await user1.client
      .from("elections")
      .update({ subject: "衆院選" })
      .eq("id", electionId);

    expect(data).toBeNull();

    const { data: updatedData } = await user1.client
      .from("elections")
      .select("*")
      .eq("id", electionId);
    expect(updatedData?.[0]?.subject).toBe("参院選");
  });

  test("認証済みユーザーは選挙を削除できない", async () => {
    const { data } = await user1.client
      .from("elections")
      .delete()
      .eq("id", electionId);

    expect(data).toBeNull();

    const { data: remainingData } = await user1.client
      .from("elections")
      .select("*")
      .eq("id", electionId);
    expect(remainingData).toBeTruthy();
  });
});
