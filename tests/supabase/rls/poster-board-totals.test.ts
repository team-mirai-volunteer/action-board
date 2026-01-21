import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "../utils";

describe("poster_board_totals テーブルのRLSテスト", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testTotalId: string;

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // Create test poster board total
    const { data, error } = await adminClient
      .from("poster_board_totals")
      .insert({
        prefecture: "埼玉県",
        city: null,
        total_count: 5000,
        source: "選挙管理委員会（テスト）",
        note: "テストデータ",
      })
      .select()
      .single();

    if (error) throw error;
    testTotalId = data.id;
  });

  afterEach(async () => {
    // Cleanup
    if (testTotalId) {
      await adminClient
        .from("poster_board_totals")
        .delete()
        .eq("id", testTotalId);
    }
    if (testUser) {
      await cleanupTestUser(testUser.user.userId);
    }
  });

  describe("SELECT操作", () => {
    it("匿名ユーザーは総数データを閲覧できる", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_board_totals")
        .select("*")
        .eq("id", testTotalId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(testTotalId);
      expect(data?.prefecture).toBe("埼玉県");
      expect(data?.total_count).toBe(5000);
    });

    it("認証済みユーザーは総数データを閲覧できる", async () => {
      const { data, error } = await testUser.client
        .from("poster_board_totals")
        .select("*")
        .eq("id", testTotalId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(testTotalId);
      expect(data?.prefecture).toBe("埼玉県");
      expect(data?.total_count).toBe(5000);
    });
  });

  describe("INSERT操作", () => {
    it("認証済みユーザーは総数データを追加できない", async () => {
      const { data, error } = await testUser.client
        .from("poster_board_totals")
        .insert({
          prefecture: "福岡県",
          city: null,
          total_count: 3000,
          source: "選挙管理委員会",
        })
        .select();

      expect(error).toBeDefined();
      expect(error?.code).toBe("42501");
      expect(data).toBeNull();
    });

    it("匿名ユーザーは総数データを追加できない", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_board_totals")
        .insert({
          prefecture: "福岡県",
          city: null,
          total_count: 3000,
          source: "選挙管理委員会",
        })
        .select();

      expect(error).toBeDefined();
      expect(error?.code).toBe("42501");
      expect(data).toBeNull();
    });
  });

  describe("UPDATE操作", () => {
    it("認証済みユーザーは総数データを更新できない", async () => {
      const { data, error } = await testUser.client
        .from("poster_board_totals")
        .update({ total_count: 6000 })
        .eq("id", testTotalId)
        .select();

      // データが更新されていないことを確認
      if (!error) {
        expect(data).toEqual([]);
      } else {
        expect(error).toBeDefined();
      }
    });

    it("匿名ユーザーは総数データを更新できない", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_board_totals")
        .update({ total_count: 6000 })
        .eq("id", testTotalId)
        .select();

      // データが更新されていないことを確認
      if (!error) {
        expect(data).toEqual([]);
      } else {
        expect(error).toBeDefined();
      }
    });
  });

  describe("DELETE操作", () => {
    it("認証済みユーザーは総数データを削除できない", async () => {
      const { data, error } = await testUser.client
        .from("poster_board_totals")
        .delete()
        .eq("id", testTotalId)
        .select();

      // データが削除されていないことを確認
      if (!error) {
        expect(data).toEqual([]);
      } else {
        expect(error).toBeDefined();
      }

      // 実際にデータがまだ存在することを確認
      const { data: checkData } = await adminClient
        .from("poster_board_totals")
        .select("*")
        .eq("id", testTotalId)
        .single();
      expect(checkData).toBeDefined();
      expect(checkData?.id).toBe(testTotalId);
    });

    it("匿名ユーザーは総数データを削除できない", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_board_totals")
        .delete()
        .eq("id", testTotalId)
        .select();

      // データが削除されていないことを確認
      if (!error) {
        expect(data).toEqual([]);
      } else {
        expect(error).toBeDefined();
      }
    });
  });

  describe("都道府県別のデータ取得", () => {
    it("認証済みユーザーは都道府県別の総数を取得できる", async () => {
      // 別の都道府県のデータを追加
      const { data: additionalData } = await adminClient
        .from("poster_board_totals")
        .insert({
          prefecture: "大阪府",
          city: null,
          total_count: 12059,
          source: "選挙管理委員会",
        })
        .select()
        .single();

      const { data, error } = await testUser.client
        .from("poster_board_totals")
        .select("*")
        .is("city", null)
        .order("prefecture");

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThanOrEqual(2);

      // Cleanup
      if (additionalData?.id) {
        await adminClient
          .from("poster_board_totals")
          .delete()
          .eq("id", additionalData.id);
      }
    });

    it("認証済みユーザーは特定の都道府県の総数を取得できる", async () => {
      const { data, error } = await testUser.client
        .from("poster_board_totals")
        .select("*")
        .eq("id", testTotalId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.prefecture).toBe("埼玉県");
      expect(data?.total_count).toBe(5000);
    });
  });
});
