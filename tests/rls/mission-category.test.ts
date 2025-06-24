import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("mission_category テーブルのRLSテスト", () => {
  let user1: Awaited<ReturnType<typeof createTestUser>>;
  let categoryId: string;

  beforeEach(async () => {
    user1 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    const categoryData = {
      id: crypto.randomUUID(),
      category_title: "テストカテゴリ for RLS",
      sort_no: 999,
      category_kbn: "TEST",
      slug: `test-category-${crypto.randomUUID()}`,
    };

    const { error } = await adminClient.from("mission_category").insert(categoryData);
    if (error) throw new Error(`カテゴリ作成エラー: ${error.message}`);

    categoryId = categoryData.id;
  });

  afterEach(async () => {
    await adminClient.from("mission_category").delete().eq("id", categoryId);
    await cleanupTestUser(user1.user.userId);
  });

  test("匿名ユーザーはカテゴリ一覧を読み取れる", async () => {
    const anonClient = getAnonClient();
    const { data, error } = await anonClient.from("mission_category").select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.some((category) => category.id === categoryId)).toBeTruthy();
  });

  test("認証済みユーザーはカテゴリ一覧を読み取れる", async () => {
    const { data, error } = await user1.client.from("mission_category").select("*");

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.some((category) => category.id === categoryId)).toBeTruthy();
  });

  test("匿名ユーザーはカテゴリを作成できない", async () => {
    const anonClient = getAnonClient();
    const newCategoryId = crypto.randomUUID();

    const { data, error } = await anonClient.from("mission_category").insert({
      id: newCategoryId,
      category_title: "匿名ユーザーからのカテゴリ",
      sort_no: 999,
      category_kbn: "TEST",
      slug: `anon-test-${crypto.randomUUID()}`,
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証済みユーザーはカテゴリを作成できない", async () => {
    const newCategoryId = crypto.randomUUID();

    const { data, error } = await user1.client.from("mission_category").insert({
      id: newCategoryId,
      category_title: "一般ユーザーからのカテゴリ",
      sort_no: 999,
      category_kbn: "TEST",
      slug: `user-test-${crypto.randomUUID()}`,
    });

    expect(error).toBeTruthy();
    expect(data).toBeNull();
  });

  test("認証済みユーザーはカテゴリを更新できない", async () => {
    const { data, error } = await user1.client
      .from("mission_category")
      .update({ category_title: "更新されたタイトル" })
      .eq("id", categoryId);

    expect(error).toBeNull();
    expect(data).toBeNull();

    const { data: updatedData } = await user1.client
      .from("mission_category")
      .select("*")
      .eq("id", categoryId);
    expect(updatedData?.[0]?.category_title).toBe("テストカテゴリ for RLS");
  });

  test("認証済みユーザーはカテゴリを削除できない", async () => {
    const { data, error } = await user1.client
      .from("mission_category")
      .delete()
      .eq("id", categoryId);

    expect(error).toBeNull();
    expect(data).toBeNull();

    const { data: remainingData } = await user1.client
      .from("mission_category")
      .select("*")
      .eq("id", categoryId);
    expect(remainingData).toBeTruthy();
    expect(remainingData?.length).toBeGreaterThan(0);
  });
});
