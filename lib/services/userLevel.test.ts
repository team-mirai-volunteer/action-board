jest.mock("@/lib/supabase/server", () => ({
  createServiceClient: jest.fn(),
}));

jest.mock("./users", () => ({
  getUser: jest.fn(),
}));

jest.mock("@/lib/utils/supabase-utils", () => ({
  executeChunkedInsert: jest.fn(),
  executeChunkedQuery: jest.fn(),
}));

jest.mock("../utils/utils", () => ({
  calculateLevel: jest.fn((xp: number) => Math.floor(xp / 100) + 1),
  calculateMissionXp: jest.fn((difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return 10;
      case "MEDIUM":
        return 20;
      case "HARD":
        return 30;
      default:
        return 10;
    }
  }),
}));

import {
  getMyUserLevel,
  getOrInitializeUserLevel,
  getUserLevel,
  getUserRank,
  getUserXpHistory,
  grantMissionCompletionXp,
  grantXp,
  grantXpBatch,
  initializeUserLevel,
} from "./userLevel";

const { createServiceClient } = require("@/lib/supabase/server");
const { getUser } = require("./users");
const {
  executeChunkedInsert,
  executeChunkedQuery,
} = require("@/lib/utils/supabase-utils");

const mockCreateServiceClient = createServiceClient as jest.MockedFunction<
  typeof createServiceClient
>;
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockExecuteChunkedInsert = executeChunkedInsert as jest.MockedFunction<
  typeof executeChunkedInsert
>;
const mockExecuteChunkedQuery = executeChunkedQuery as jest.MockedFunction<
  typeof executeChunkedQuery
>;

describe("userLevel service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn(),
      maybeSingle: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn(),
      gt: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
    };

    mockCreateServiceClient.mockResolvedValue(mockSupabase);
    mockGetUser.mockResolvedValue({ id: "user-1", email: "test@example.com" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyUserLevel", () => {
    it("自分のユーザーレベルを正常に取得する", async () => {
      const mockUser = { id: "user-1" };
      const mockUserLevel = {
        user_id: "user-1",
        level: 5,
        xp: 500,
        last_notified_level: 3,
      };

      mockGetUser.mockResolvedValue(mockUser);
      mockSupabase.maybeSingle.mockResolvedValue({
        data: mockUserLevel,
        error: null,
      });

      const result = await getMyUserLevel();

      expect(result).toEqual(mockUserLevel);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_levels");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("認証されていない場合はnullを返す", async () => {
      mockGetUser.mockResolvedValue(null);

      const result = await getMyUserLevel();

      expect(result).toBeNull();
    });

    it("ユーザーレベルが見つからない場合はnullを返す", async () => {
      const mockUser = { id: "user-1" };

      mockGetUser.mockResolvedValue(mockUser);
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await getMyUserLevel();

      expect(result).toBeNull();
    });

    it("エラーが発生した場合はnullを返す", async () => {
      const mockUser = { id: "user-1" };

      mockGetUser.mockResolvedValue(mockUser);
      mockSupabase.maybeSingle.mockResolvedValue({
        data: null,
        error: { message: "データベースエラー" },
      });

      const result = await getMyUserLevel();

      expect(result).toBeNull();
    });
  });

  describe("getUserLevel", () => {
    it("指定されたユーザーのレベルを正常に取得する", async () => {
      const mockUserLevel = {
        user_id: "user-2",
        level: 8,
        xp: 800,
        last_notified_level: 7,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserLevel,
        error: null,
      });

      const result = await getUserLevel("user-2");

      expect(result).toEqual(mockUserLevel);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_levels");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-2");
    });

    it("ユーザーレベルが見つからない場合はnullを返す", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const result = await getUserLevel("non-existent-user");

      expect(result).toBeNull();
    });

    it("エラーが発生した場合はnullを返す", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "ユーザーが見つかりません" },
      });

      const result = await getUserLevel("user-2");

      expect(result).toBeNull();
    });
  });

  describe("initializeUserLevel", () => {
    it("新規ユーザーレベルを正常に初期化する", async () => {
      const mockInitialLevel = {
        user_id: "new-user",
        level: 1,
        xp: 0,
        last_notified_level: 1,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockInitialLevel,
        error: null,
      });

      const result = await initializeUserLevel("new-user");

      expect(result).toEqual(mockInitialLevel);
      expect(mockSupabase.from).toHaveBeenCalledWith("user_levels");
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: "new-user",
        xp: 0,
        level: 1,
      });
    });

    it("初期化エラーが発生した場合はnullを返す", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "初期化エラー" },
      });

      const result = await initializeUserLevel("new-user");

      expect(result).toBeNull();
    });

    it("予期しないエラーが発生した場合はnullを返す", async () => {
      mockSupabase.insert.mockReturnValue(mockSupabase);
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "予期しないエラー" },
      });

      const result = await initializeUserLevel("new-user");

      expect(result).toBeNull();
    });
  });

  describe("getOrInitializeUserLevel", () => {
    it("既存のユーザーレベルを取得する", async () => {
      const mockUserLevel = {
        user_id: "user-1",
        level: 5,
        xp: 500,
        last_notified_level: 3,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserLevel,
        error: null,
      });

      const result = await getOrInitializeUserLevel("user-1");

      expect(result).toEqual(mockUserLevel);
    });

    it("ユーザーレベルが存在しない場合は初期化する", async () => {
      const mockInitialLevel = {
        user_id: "new-user",
        level: 1,
        xp: 0,
        last_notified_level: 1,
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: mockInitialLevel, error: null });

      const result = await getOrInitializeUserLevel("new-user");

      expect(result).toEqual(mockInitialLevel);
    });
  });

  describe("grantXp", () => {
    it("XPを正常に付与する", async () => {
      const mockCurrentLevel = {
        user_id: "user-1",
        level: 1,
        xp: 50,
        last_notified_level: 1,
      };

      const mockUpdatedLevel = {
        user_id: "user-1",
        level: 2,
        xp: 150,
        last_notified_level: 1,
      };

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockCurrentLevel, error: null })
        .mockResolvedValueOnce({ data: mockUpdatedLevel, error: null });

      const result = await grantXp("user-1", 100, "BONUS");

      expect(result.success).toBe(true);
      expect(result.userLevel).toEqual(mockUpdatedLevel);
    });

    it("XPトランザクション作成エラーの場合は失敗を返す", async () => {
      mockSupabase.insert.mockResolvedValue({
        error: { message: "トランザクション作成エラー" },
      });

      const result = await grantXp("user-1", 100, "BONUS");

      expect(result.success).toBe(false);
      expect(result.error).toBe("トランザクション作成エラー");
    });
  });

  describe("getUserXpHistory", () => {
    it("ユーザーのXP履歴を正常に取得する", async () => {
      const mockHistory = [
        {
          id: "1",
          user_id: "user-1",
          xp_amount: 100,
          source_type: "MISSION_COMPLETION",
          created_at: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          user_id: "user-1",
          xp_amount: 50,
          source_type: "BONUS",
          created_at: "2023-01-02T00:00:00Z",
        },
      ];

      mockSupabase.limit.mockResolvedValue({ data: mockHistory, error: null });

      const result = await getUserXpHistory("user-1");

      expect(result).toEqual(mockHistory);
      expect(mockSupabase.from).toHaveBeenCalledWith("xp_transactions");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(mockSupabase.limit).toHaveBeenCalledWith(50);
    });

    it("エラーが発生した場合は空配列を返す", async () => {
      mockSupabase.limit.mockResolvedValue({
        data: null,
        error: { message: "データベースエラー" },
      });

      const result = await getUserXpHistory("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("getUserRank", () => {
    it("ユーザーのランクを正常に取得する", async () => {
      const mockUserLevel = { xp: 500 };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserLevel,
        error: null,
      });

      const mockCountQuery = {
        select: jest.fn().mockReturnValue({
          gt: jest.fn().mockResolvedValue({ count: 10, error: null }),
        }),
      };
      mockSupabase.from
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockCountQuery);

      const result = await getUserRank("user-1");

      expect(result).toBe(11); // 10 + 1
    });

    it("ユーザーが見つからない場合はnullを返す", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const result = await getUserRank("non-existent-user");

      expect(result).toBeNull();
    });

    it("ランク計算エラーの場合はnullを返す", async () => {
      const mockUserLevel = { xp: 500 };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUserLevel,
        error: null,
      });

      const mockCountQuery = {
        select: jest.fn().mockReturnValue({
          gt: jest
            .fn()
            .mockResolvedValue({
              count: null,
              error: { message: "計算エラー" },
            }),
        }),
      };
      mockSupabase.from
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockCountQuery);

      const result = await getUserRank("user-1");

      expect(result).toBeNull();
    });
  });

  describe("grantMissionCompletionXp", () => {
    it("ミッション完了XPを正常に付与する", async () => {
      const mockMission = {
        difficulty: "MEDIUM",
        title: "テストミッション",
      };

      const mockCurrentLevel = {
        user_id: "user-1",
        level: 1,
        xp: 50,
        last_notified_level: 1,
      };

      const mockUpdatedLevel = {
        user_id: "user-1",
        level: 1,
        xp: 70,
        last_notified_level: 1,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockMission,
        error: null,
      });

      mockSupabase.insert.mockResolvedValueOnce({ error: null });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCurrentLevel,
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedLevel,
        error: null,
      });

      const result = await grantMissionCompletionXp(
        "user-1",
        "mission-1",
        "achievement-1",
      );

      expect(result.success).toBe(true);
      expect(result.xpGranted).toBe(20); // MEDIUM difficulty = 20 XP
      expect(result.userLevel).toEqual(mockUpdatedLevel);
    });

    it("ミッション情報取得エラーの場合は失敗を返す", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "ミッション取得エラー" },
      });

      const result = await grantMissionCompletionXp(
        "user-1",
        "mission-1",
        "achievement-1",
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("ミッション情報の取得に失敗しました");
    });
  });

  describe("grantXpBatch", () => {
    it("空のトランザクション配列の場合は成功を返す", async () => {
      const result = await grantXpBatch([]);

      expect(result.success).toBe(true);
      expect(result.results).toEqual([]);
    });

    it("バッチXP付与を正常に実行する", async () => {
      const transactions = [
        {
          userId: "user-1",
          xpAmount: 100,
          sourceType: "MISSION_COMPLETION" as const,
          sourceId: "mission-1",
          description: "テストミッション完了",
        },
        {
          userId: "user-2",
          xpAmount: 50,
          sourceType: "BONUS" as const,
        },
      ];

      const mockCurrentLevels = [
        { user_id: "user-1", level: 1, xp: 50 },
        { user_id: "user-2", level: 1, xp: 25 },
      ];

      mockExecuteChunkedQuery.mockResolvedValue({
        data: mockCurrentLevels,
        error: null,
      });

      mockExecuteChunkedInsert.mockResolvedValue({ error: null });

      mockSupabase.upsert.mockResolvedValue({ error: null });

      const result = await grantXpBatch(transactions);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].userId).toBe("user-1");
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].newXp).toBe(150);
      expect(result.results[1].userId).toBe("user-2");
      expect(result.results[1].success).toBe(true);
      expect(result.results[1].newXp).toBe(75);
    });

    it("レベル取得エラーの場合は失敗を返す", async () => {
      const transactions = [
        {
          userId: "user-1",
          xpAmount: 100,
          sourceType: "MISSION_COMPLETION" as const,
        },
      ];

      mockExecuteChunkedQuery.mockResolvedValue({
        data: null,
        error: { message: "レベル取得エラー" },
      });

      const result = await grantXpBatch(transactions);

      expect(result.success).toBe(false);
      expect(result.error).toBe("レベル取得エラー");
    });
  });
});
