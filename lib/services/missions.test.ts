import { hasFeaturedMissions } from "./missions";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

const { createClient } = require("@/lib/supabase/server");
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe("missions service", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("hasFeaturedMissions", () => {
    it("注目ミッションが存在する場合はtrueを返す", async () => {
      mockSupabase.eq.mockResolvedValue({ count: 5 });

      const result = await hasFeaturedMissions();

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("missions");
      expect(mockSupabase.select).toHaveBeenCalledWith("id", {
        count: "exact",
        head: true,
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith("is_featured", true);
    });

    it("注目ミッションが存在しない場合はfalseを返す", async () => {
      mockSupabase.eq.mockResolvedValue({ count: 0 });

      const result = await hasFeaturedMissions();

      expect(result).toBe(false);
    });

    it("countがnullの場合はfalseを返す", async () => {
      mockSupabase.eq.mockResolvedValue({ count: null });

      const result = await hasFeaturedMissions();

      expect(result).toBe(false);
    });

    it("countがundefinedの場合はfalseを返す", async () => {
      mockSupabase.eq.mockResolvedValue({ count: undefined });

      const result = await hasFeaturedMissions();

      expect(result).toBe(false);
    });
  });
});
