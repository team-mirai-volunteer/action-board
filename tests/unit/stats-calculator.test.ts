import {
  type VideoStatsRecord,
  calculateDailyViewsIncrease,
} from "@/lib/utils/stats-calculator";

describe("calculateDailyViewsIncrease", () => {
  const TODAY = "2026-01-26";
  const YESTERDAY = "2026-01-25";
  const DAY_BEFORE_YESTERDAY = "2026-01-24";

  describe("今日のデータがある場合", () => {
    it("今日と昨日のデータがある場合、差分を計算する", () => {
      const stats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: 80 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(100);
      expect(result.comparisonViews).toBe(80);
      expect(result.dailyViewsIncrease).toBe(20);
    });

    it("今日のデータのみで昨日がない場合、一昨日と比較する", () => {
      const stats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 60 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(100);
      expect(result.comparisonViews).toBe(60);
      expect(result.dailyViewsIncrease).toBe(40);
    });

    it("今日のデータのみで比較対象がない場合、増加数は総数と同じ", () => {
      const stats: VideoStatsRecord[][] = [
        [{ recorded_at: TODAY, view_count: 100 }],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(100);
      expect(result.comparisonViews).toBe(0);
      expect(result.dailyViewsIncrease).toBe(100);
    });
  });

  describe("今日のデータがない場合（最新が昨日）", () => {
    it("昨日と一昨日のデータがある場合、差分を計算する", () => {
      const stats: VideoStatsRecord[][] = [
        [
          { recorded_at: YESTERDAY, view_count: 80 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 60 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(80);
      expect(result.comparisonViews).toBe(60);
      expect(result.dailyViewsIncrease).toBe(20);
    });

    it("昨日のデータのみで一昨日がない場合、増加数は総数と同じ", () => {
      // ユーザーのケース: 1/26データなし、1/25が25 → +25
      const stats: VideoStatsRecord[][] = [
        [{ recorded_at: YESTERDAY, view_count: 25 }],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(25);
      expect(result.comparisonViews).toBe(0);
      expect(result.dailyViewsIncrease).toBe(25);
    });
  });

  describe("最新データが一昨日以前の場合", () => {
    it("比較対象がないため増加数は0", () => {
      const stats: VideoStatsRecord[][] = [
        [{ recorded_at: "2026-01-23", view_count: 50 }],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(50);
      expect(result.comparisonViews).toBe(0);
      expect(result.dailyViewsIncrease).toBe(50);
    });
  });

  describe("複数動画の場合", () => {
    it("各動画の統計を合算して計算する", () => {
      const stats: VideoStatsRecord[][] = [
        // 動画1: 今日100、昨日80
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: 80 },
        ],
        // 動画2: 昨日50、一昨日30
        [
          { recorded_at: YESTERDAY, view_count: 50 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 30 },
        ],
        // 動画3: 昨日25のみ
        [{ recorded_at: YESTERDAY, view_count: 25 }],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      // totalViews: 100 + 50 + 25 = 175
      // comparisonViews: 80 (動画1の昨日) + 30 (動画2の一昨日) + 0 (動画3は比較なし) = 110
      // increase: 175 - 110 = 65
      expect(result.totalViews).toBe(175);
      expect(result.comparisonViews).toBe(110);
      expect(result.dailyViewsIncrease).toBe(65);
    });

    it("空の配列の場合は0を返す", () => {
      const stats: VideoStatsRecord[][] = [];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(0);
      expect(result.comparisonViews).toBe(0);
      expect(result.dailyViewsIncrease).toBe(0);
    });

    it("view_countがnullの場合は0として扱う", () => {
      const stats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: null },
          { recorded_at: YESTERDAY, view_count: 50 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        stats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result.totalViews).toBe(0);
      expect(result.comparisonViews).toBe(50);
      expect(result.dailyViewsIncrease).toBe(-50);
    });
  });
});
