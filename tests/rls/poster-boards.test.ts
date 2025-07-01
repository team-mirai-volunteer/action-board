import {
  adminClient,
  cleanupTestUser,
  createTestUser,
  getAnonClient,
} from "./utils";

describe("poster_boards テーブルのRLSテスト", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;
  let testBoardId: string;

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // Create test poster board
    const { data, error } = await adminClient
      .from("poster_boards")
      .insert({
        name: "Test Board",
        lat: 35.6762,
        long: 139.6503,
        prefecture: "東京都",
        status: "not_yet",
        number: "TEST-001",
        address: "テストアドレス1-1-1",
        city: "テスト市",
      })
      .select()
      .single();

    if (error) throw error;
    testBoardId = data.id;
  });

  afterEach(async () => {
    // Cleanup
    if (testBoardId) {
      await adminClient.from("poster_boards").delete().eq("id", testBoardId);
    }
    if (testUser) {
      await cleanupTestUser(testUser.user.userId);
    }
  });

  describe("SELECT操作", () => {
    it("匿名ユーザーはボードを閲覧できる", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_boards")
        .select("*")
        .eq("id", testBoardId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(testBoardId);
    });

    it("認証済みユーザーはボードを閲覧できる", async () => {
      const { data, error } = await testUser.client
        .from("poster_boards")
        .select("*")
        .eq("id", testBoardId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data![0].id).toBe(testBoardId);
    });
  });

  describe("UPDATE操作", () => {
    it("認証済みユーザーはボードのステータスを更新できる", async () => {
      const { error } = await testUser.client
        .from("poster_boards")
        .update({ status: "posted" })
        .eq("id", testBoardId);

      expect(error).toBeNull();

      // Verify the update
      const { data } = await adminClient
        .from("poster_boards")
        .select("status")
        .eq("id", testBoardId)
        .single();

      expect(data?.status).toBe("posted");
    });

    it("匿名ユーザーはボードを更新できない", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_boards")
        .update({ status: "posted" })
        .eq("id", testBoardId)
        .select();

      // RLS should block the update and return empty data
      expect(error).toBeNull();
      expect(data).toEqual([]);
      
      // Verify the update did not happen
      const { data: verifyData } = await adminClient
        .from("poster_boards")
        .select("status")
        .eq("id", testBoardId)
        .single();

      expect(verifyData?.status).toBe("not_yet");
    });
  });

  describe("INSERT操作", () => {
    it("ユーザーは新しいボードを作成できない（管理者のみ）", async () => {
      const { error } = await testUser.client
        .from("poster_boards")
        .insert({
          name: "Unauthorized Board",
          lat: 35.0,
          long: 139.0,
          prefecture: "東京都",
          status: "not_yet",
          number: "TEST-002",
          address: "テストアドレス2-2-2",
          city: "テスト市2",
        });

      expect(error).not.toBeNull();
    });
  });

  describe("DELETE操作", () => {
    it("ユーザーはボードを削除できない（管理者のみ）", async () => {
      // Try to delete as a regular user
      const { data } = await testUser.client
        .from("poster_boards")
        .delete()
        .eq("id", testBoardId)
        .select();

      // When RLS blocks the operation, Supabase returns empty data array
      expect(data).toEqual([]);
      
      // Verify the board still exists
      const { data: afterData } = await adminClient
        .from("poster_boards")
        .select("id")
        .eq("id", testBoardId);
      
      expect(afterData).toHaveLength(1);
    });
  });
});

describe("poster_board_status_history テーブルのRLSテスト", () => {
  let testUser1: Awaited<ReturnType<typeof createTestUser>>;
  let testUser2: Awaited<ReturnType<typeof createTestUser>>;
  let testBoardId: string;

  beforeEach(async () => {
    // Create test users
    testUser1 = await createTestUser(`${crypto.randomUUID()}@example.com`);
    testUser2 = await createTestUser(`${crypto.randomUUID()}@example.com`);

    // Create test board
    const { data: boardData } = await adminClient
      .from("poster_boards")
      .insert({
        name: "History Test Board",
        lat: 35.6762,
        long: 139.6503,
        prefecture: "東京都",
        status: "not_yet",
        number: "TEST-003",
        address: "テストアドレス3-3-3",
        city: "テスト市3",
      })
      .select()
      .single();

    testBoardId = boardData!.id;

    // Create test history entry
    await adminClient
      .from("poster_board_status_history")
      .insert({
        board_id: testBoardId,
        user_id: testUser1.user.userId,
        previous_status: "not_yet",
        new_status: "posted",
        note: "Test note",
      });
  });

  afterEach(async () => {
    // Cleanup
    await adminClient
      .from("poster_board_status_history")
      .delete()
      .eq("board_id", testBoardId);
    await adminClient.from("poster_boards").delete().eq("id", testBoardId);
    
    if (testUser1) {
      await cleanupTestUser(testUser1.user.userId);
    }
    if (testUser2) {
      await cleanupTestUser(testUser2.user.userId);
    }
  });

  describe("SELECT操作", () => {
    it("匿名ユーザーは履歴を閲覧できない", async () => {
      const anonClient = getAnonClient();
      const { data, error } = await anonClient
        .from("poster_board_status_history")
        .select("*")
        .eq("board_id", testBoardId);

      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("認証済みユーザーは履歴を閲覧できる", async () => {
      const { data, error } = await testUser1.client
        .from("poster_board_status_history")
        .select("*")
        .eq("board_id", testBoardId);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
    });
  });

  describe("INSERT操作", () => {
    it("認証済みユーザーは自分の履歴レコードを作成できる", async () => {
      const { data, error } = await testUser1.client
        .from("poster_board_status_history")
        .insert({
          board_id: testBoardId,
          user_id: testUser1.user.userId,
          previous_status: "posted",
          new_status: "checked",
          note: "Verified poster is present",
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data!.user_id).toBe(testUser1.user.userId);

      // Cleanup
      if (data) {
        await adminClient
          .from("poster_board_status_history")
          .delete()
          .eq("id", data.id);
      }
    });

    it("他のユーザーの履歴を作成することはできない", async () => {
      const { error } = await testUser1.client
        .from("poster_board_status_history")
        .insert({
          board_id: testBoardId,
          user_id: testUser2.user.userId, // Different user
          previous_status: "posted",
          new_status: "checked",
        });

      expect(error).not.toBeNull();
    });

    it("匿名ユーザーは履歴を作成できない", async () => {
      const anonClient = getAnonClient();
      const { error } = await anonClient
        .from("poster_board_status_history")
        .insert({
          board_id: testBoardId,
          user_id: "00000000-0000-0000-0000-000000000000", // Dummy UUID since null is not allowed
          previous_status: "posted",
          new_status: "checked",
          note: "Anonymous check",
        })
        .select();

      expect(error).not.toBeNull();
      expect(error?.code).toBe("42501"); // insufficient_privilege
    });
  });
});