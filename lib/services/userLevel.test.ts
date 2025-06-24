import { getMyUserLevel, getUserLevel, initializeUserLevel } from "./userLevel";

jest.mock("@/lib/supabase/server", () => ({
  createServiceClient: jest.fn(),
}));

jest.mock("./users", () => ({
  getUser: jest.fn(),
}));

const { createServiceClient } = require("@/lib/supabase/server");
const { getUser } = require("./users");
const mockCreateServiceClient = createServiceClient as jest.MockedFunction<
  typeof createServiceClient
>;
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;

describe("userLevel service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      insert: jest.fn().mockReturnThis(),
    };
    mockCreateServiceClient.mockResolvedValue(mockSupabase);
    mockGetUser.mockResolvedValue({ id: "user-1", email: "test@example.com" });

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.upsert.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
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
});
