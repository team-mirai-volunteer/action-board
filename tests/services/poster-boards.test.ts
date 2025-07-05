import { getPosterBoardStatsAction, getUserEditedBoardIdsAction } from "@/lib/actions/poster-boards";
import { getPosterBoardsMinimal } from "@/lib/services/poster-boards";
import { createClient } from "@/lib/supabase/server";

// Mock Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("Poster Board Services", () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    mockSupabase = {
      from: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
      range: jest.fn(() => mockSupabase),
      order: jest.fn(() => mockSupabase),
      rpc: jest.fn(),
    };
    
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("getPosterBoardsMinimal", () => {
    it("should fetch boards with pagination", async () => {
      const mockBoards = Array.from({ length: 5000 }, (_, i) => ({
        id: `board-${i}`,
        lat: 35.6762 + i * 0.001,
        long: 139.6503 + i * 0.001,
        status: "not_yet",
      }));

      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.range.mockReturnValue(mockSupabase);
      mockSupabase.order.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockReturnValue(Promise.resolve({
        data: mockBoards,
        error: null,
      }));

      const result = await getPosterBoardsMinimal("東京都");

      expect(mockSupabase.from).toHaveBeenCalledWith("poster_boards");
      expect(mockSupabase.select).toHaveBeenCalledWith("id,lat,long,status");
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 4999);
      expect(mockSupabase.order).toHaveBeenCalledWith("id", { ascending: true });
      expect(result).toHaveLength(5000);
    });

    it("should handle empty results correctly", async () => {
      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.range.mockReturnValue(mockSupabase);
      mockSupabase.order.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockReturnValue(Promise.resolve({
        data: [],
        error: null,
      }));

      const result = await getPosterBoardsMinimal("東京都");

      expect(result).toHaveLength(0);
    });
  });

  describe("getPosterBoardStatsAction", () => {
    it("should use RPC function for optimized stats retrieval", async () => {
      const mockStats = {
        total_count: 15000,
        status_counts: {
          not_yet: 6000,
          reserved: 2250,
          done: 4500,
          error_wrong_place: 750,
          error_damaged: 750,
          error_wrong_poster: 375,
          other: 375,
        },
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await getPosterBoardStatsAction("東京都");

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_poster_board_stats_optimized",
        { target_prefecture: "東京都" }
      );
      expect(result.totalCount).toBe(15000);
      expect(result.statusCounts.done).toBe(4500);
    });

    it("should fallback to individual queries on RPC error", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: new Error("RPC function not found"),
      });

      mockSupabase.select.mockReturnValue(mockSupabase);
      mockSupabase.eq.mockReturnValue(Promise.resolve({
        count: 100,
        error: null,
      }));

      const result = await getPosterBoardStatsAction("東京都");

      // Should have called select for each status type + total
      expect(mockSupabase.select).toHaveBeenCalledTimes(8);
      expect(result.totalCount).toBe(100);
    });
  });

  describe("getUserEditedBoardIdsAction", () => {
    it("should fetch user edited board IDs using RPC", async () => {
      const mockBoardIds = ["board-1", "board-2", "board-3"];

      mockSupabase.rpc.mockResolvedValue({
        data: mockBoardIds.map(id => ({ board_id: id })),
        error: null,
      });

      const result = await getUserEditedBoardIdsAction("東京都", "user-123");

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_edited_boards_by_prefecture",
        {
          target_prefecture: "東京都",
          target_user_id: "user-123",
        }
      );
      expect(result).toEqual(mockBoardIds);
    });

    it("should return empty array on error", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      const result = await getUserEditedBoardIdsAction("東京都", "user-123");

      expect(result).toEqual([]);
    });
  });
});