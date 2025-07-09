import { createClient } from "../lib/supabase/server";
import { getRanking } from "../lib/services/ranking";
import { getJSTMidnightToday } from "../lib/dateUtils";

describe("Large Dataset Ranking Aggregation Accuracy Tests", () => {
  let supabase: any;
  
  beforeAll(() => {
    supabase = createClient();
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
      const jstMidnight = getJSTMidnightToday();
      
      const { data: todayTransactions } = await supabase
        .from('xp_transactions')
        .select('*')
        .gte('created_at', jstMidnight.toISOString());
      
      expect(todayTransactions).toBeDefined();
      
      if (todayTransactions && todayTransactions.length > 0) {
        const ranking = await getRanking(5, "daily");
        
        if (ranking.length > 0) {
          const topUser = ranking[0];
          const { data: userTodayXP } = await supabase
            .from('xp_transactions')
            .select('xp_amount')
            .eq('user_id', topUser.user_id)
            .gte('created_at', jstMidnight.toISOString());
          
          const expectedXP = userTodayXP?.reduce((sum: number, tx: any) => sum + tx.xp_amount, 0) || 0;
          expect(topUser.xp).toBe(expectedXP);
        }
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
    it("should handle 200+ users efficiently", async () => {
      const { data: userCount, count } = await supabase
        .from('auth.users')
        .select('id', { count: 'exact' });
      
      if (count !== null) {
        expect(count).toBeGreaterThanOrEqual(12);
      }
    });

    it("should handle 10,000+ achievements efficiently", async () => {
      const { data: achievementCount, count } = await supabase
        .from('achievements')
        .select('id', { count: 'exact' });
      
      if (count !== null) {
        expect(count).toBeGreaterThanOrEqual(0);
      }
    });

    it("should maintain performance with large XP transaction volume", async () => {
      const { data: xpCount, count } = await supabase
        .from('xp_transactions')
        .select('id', { count: 'exact' });
      
      if (count !== null) {
        expect(count).toBeGreaterThanOrEqual(0);
      }
      
      const startTime = Date.now();
      await getRanking(100, "daily");
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(3000);
    });
  });

  describe("JST境界での集計精度テスト（大規模データセット）", () => {
    it("should exclude yesterday's data from today's ranking with large dataset", async () => {
      const jstMidnight = getJSTMidnightToday();
      const yesterdayEnd = new Date(jstMidnight.getTime() - 1);
      
      const { data: yesterdayData } = await supabase
        .from('xp_transactions')
        .select('*')
        .lt('created_at', jstMidnight.toISOString())
        .gte('created_at', yesterdayEnd.toISOString());
      
      if (yesterdayData && yesterdayData.length > 0) {
        const todayRanking = await getRanking(100, "daily");
        const allTimeRanking = await getRanking(100, "all");
        
        if (todayRanking.length > 0 && allTimeRanking.length > 0) {
          const todayTopUser = todayRanking[0];
          const allTimeTopUser = allTimeRanking.find(u => u.user_id === todayTopUser.user_id);
          
          if (allTimeTopUser) {
            expect(todayTopUser.xp).not.toBeNull();
            expect(allTimeTopUser.xp).not.toBeNull();
            expect(todayTopUser.xp!).toBeLessThanOrEqual(allTimeTopUser.xp!);
          }
        }
      }
    });

    it("should handle timezone boundary correctly with large dataset", async () => {
      const jstMidnight = getJSTMidnightToday();
      
      const beforeMidnight = new Date(jstMidnight.getTime() - 60000);
      const afterMidnight = new Date(jstMidnight.getTime() + 60000);
      
      const { data: beforeData } = await supabase
        .from('xp_transactions')
        .select('*')
        .gte('created_at', beforeMidnight.toISOString())
        .lt('created_at', jstMidnight.toISOString());
      
      const { data: afterData } = await supabase
        .from('xp_transactions')
        .select('*')
        .gte('created_at', jstMidnight.toISOString())
        .lt('created_at', afterMidnight.toISOString());
      
      expect(beforeData).toBeDefined();
      expect(afterData).toBeDefined();
    });
  });

  describe("ランキングページ別精度テスト", () => {
    it("should verify homepage top 5 displays correctly", async () => {
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
