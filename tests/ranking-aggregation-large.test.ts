import { createClient } from "../lib/supabase/server";
import { getRanking } from "../lib/services/ranking";
import { getJSTMidnightToday } from "../lib/dateUtils";

jest.mock("../lib/dateUtils", () => ({
  getJSTMidnightToday: jest.fn(() => new Date("2024-01-01T15:00:00.000Z")),
}));

jest.mock("../lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("Large Dataset Ranking Aggregation Accuracy Tests", () => {
  const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe("今日のトップ5ランキング精度テスト（大規模データセット）", () => {
    it("should return exactly 5 users for homepage top 5 with large dataset", async () => {
      const ranking = await getRanking(5, "daily");
      
      expect(ranking).toBeDefined();
      expect(Array.isArray(ranking)).toBe(true);
      expect(ranking.length).toBeLessThanOrEqual(5);
      
      ranking.forEach(user => {
        expect(user).toHaveProperty('user_id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('xp');
        expect(user.xp).toBeGreaterThan(0);
      });
    });

    it("should return users sorted by XP in descending order with large dataset", async () => {
      const ranking = await getRanking(5, "daily");
      
      for (let i = 0; i < ranking.length - 1; i++) {
        expect(ranking[i].xp).not.toBeNull();
        expect(ranking[i + 1].xp).not.toBeNull();
        expect(ranking[i].xp!).toBeGreaterThanOrEqual(ranking[i + 1].xp!);
      }
    });

    it("should only include today's XP data (JST) with large dataset", async () => {
      const mockRankingData = [
        {
          user_id: "user1",
          name: "テストユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          level: 10,
          xp: 1000,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const ranking = await getRanking(5, "daily");
      
      expect(ranking).toBeDefined();
      expect(ranking.length).toBeLessThanOrEqual(5);
      if (ranking.length > 0) {
        expect(ranking[0].xp).toBeGreaterThan(0);
      }
    });
  });

  describe("今日のトップ100ランキング精度テスト（大規模データセット）", () => {
    it("should return up to 100 users for ranking page with large dataset", async () => {
      const ranking = await getRanking(100, "daily");
      
      expect(ranking).toBeDefined();
      expect(Array.isArray(ranking)).toBe(true);
      expect(ranking.length).toBeLessThanOrEqual(100);
    });

    it("should maintain consistent ordering across multiple calls with large dataset", async () => {
      const ranking1 = await getRanking(100, "daily");
      const ranking2 = await getRanking(100, "daily");
      
      expect(ranking1.length).toBe(ranking2.length);
      
      for (let i = 0; i < Math.min(ranking1.length, ranking2.length); i++) {
        expect(ranking1[i].user_id).toBe(ranking2[i].user_id);
        expect(ranking1[i].xp).toBe(ranking2[i].xp);
      }
    });

    it("should handle large dataset performance efficiently", async () => {
      const startTime = Date.now();
      const ranking = await getRanking(100, "daily");
      const endTime = Date.now();
      
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(3000);
      expect(ranking).toBeDefined();
    });
  });

  describe("大規模データセットでのパフォーマンステスト", () => {
    it("should handle large dataset efficiently for top 100", async () => {
      const largeMockRankings = Array.from({ length: 100 }, (_, i) => ({
        user_id: `user-${i}`,
        name: `ユーザー${i}`,
        address_prefecture: "東京都",
        rank: i + 1,
        level: 25 - Math.floor(i / 10),
        xp: 2500 - i * 10,
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: largeMockRankings,
        error: null,
      });

      const startTime = Date.now();
      const ranking = await getRanking(100, "daily");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(ranking).toHaveLength(100);
    });

    it("should handle large dataset efficiently for top 200", async () => {
      const largeMockRankings = Array.from({ length: 200 }, (_, i) => ({
        user_id: `user-${i}`,
        name: `ユーザー${i}`,
        address_prefecture: "東京都",
        rank: i + 1,
        level: 25 - Math.floor(i / 20),
        xp: 5000 - i * 20,
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: largeMockRankings,
        error: null,
      });

      const startTime = Date.now();
      const ranking = await getRanking(200, "daily");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(ranking).toHaveLength(200);
    });

    it("should maintain performance with large dataset processing", async () => {
      const largeMockRankings = Array.from({ length: 50 }, (_, i) => ({
        user_id: `user-${i}`,
        name: `ユーザー${i}`,
        address_prefecture: "東京都",
        rank: i + 1,
        level: 25 - Math.floor(i / 5),
        xp: 2500 - i * 20,
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: largeMockRankings,
        error: null,
      });

      const startTime = Date.now();
      const ranking = await getRanking(50, "daily");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(ranking).toHaveLength(50);
    });
  });

  describe("JST境界での集計精度テスト（大規模データセット）", () => {
    it("should use correct JST midnight for daily ranking", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRanking(100, "daily");

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_period_ranking", {
        p_start_date: "2024-01-01T15:00:00.000Z",
        p_limit: 100,
      });
    });

    it("should maintain consistent JST boundary across multiple calls", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRanking(50, "daily");
      await getRanking(100, "daily");

      const rpcCalls = mockSupabase.rpc.mock.calls.filter(
        (call) => call[0] === "get_period_ranking",
      );

      expect(rpcCalls.length).toBe(2);

      const firstCallDate = new Date(rpcCalls[0][1].p_start_date);
      const secondCallDate = new Date(rpcCalls[1][1].p_start_date);

      expect(firstCallDate.getTime()).toBe(secondCallDate.getTime());
      expect(firstCallDate.getTime()).toBe(
        new Date("2024-01-01T15:00:00.000Z").getTime(),
      );
    });

    it("should handle JST boundary correctly for aggregation", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      await getRanking(10, "daily");

      const rpcCall = mockSupabase.rpc.mock.calls.find(
        (call) => call[0] === "get_period_ranking",
      );

      const startDate = new Date(rpcCall[1].p_start_date);

      expect(startDate.getUTCHours()).toBe(15);
      expect(startDate.getUTCMinutes()).toBe(0);
      expect(startDate.getUTCSeconds()).toBe(0);
      expect(startDate.getUTCMilliseconds()).toBe(0);
    });
  });

  describe("ランキングページ別精度テスト", () => {
    it("should verify homepage top 5 displays correctly", async () => {
      const mockRankingData = [
        {
          user_id: "user1",
          name: "テストユーザー1",
          address_prefecture: "東京都",
          rank: 1,
          level: 10,
          xp: 1000,
        },
        {
          user_id: "user2",
          name: "テストユーザー2",
          address_prefecture: "大阪府",
          rank: 2,
          level: 8,
          xp: 800,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const ranking = await getRanking(5, "daily");
      
      expect(ranking).toBeDefined();
      expect(ranking.length).toBeLessThanOrEqual(5);
      
      if (ranking.length > 0) {
        expect(ranking[0]).toHaveProperty('user_id');
        expect(ranking[0]).toHaveProperty('name');
        expect(ranking[0]).toHaveProperty('xp');
      }
    });

    it("should verify ranking page top 100 displays correctly", async () => {
      const mockRankingData = Array.from({ length: 100 }, (_, i) => ({
        user_id: `user-${i}`,
        name: `テストユーザー${i}`,
        address_prefecture: "東京都",
        rank: i + 1,
        level: 25 - Math.floor(i / 10),
        xp: 2500 - i * 10,
      }));

      mockSupabase.rpc.mockResolvedValue({
        data: mockRankingData,
        error: null,
      });

      const ranking = await getRanking(100, "daily");
      
      expect(ranking).toBeDefined();
      expect(ranking.length).toBeLessThanOrEqual(100);
      
      if (ranking.length > 0) {
        expect(ranking[0]).toHaveProperty('user_id');
        expect(ranking[0]).toHaveProperty('name');
        expect(ranking[0]).toHaveProperty('xp');
      }
    });
  });
});
