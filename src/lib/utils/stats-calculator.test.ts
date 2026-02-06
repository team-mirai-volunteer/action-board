import {
  calculateDailyViewsIncrease,
  type VideoStatsRecord,
} from "./stats-calculator";

const TODAY = "2025-01-15";
const YESTERDAY = "2025-01-14";
const DAY_BEFORE_YESTERDAY = "2025-01-13";

describe("calculateDailyViewsIncrease", () => {
  describe("基本的な計算", () => {
    test("今日と昨日のデータがある場合、正しい増加数を計算する", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: 80 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 100,
        comparisonViews: 80,
        dailyViewsIncrease: 20,
      });
    });

    test("複数動画の合計を正しく計算する", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: 80 },
        ],
        [
          { recorded_at: TODAY, view_count: 200 },
          { recorded_at: YESTERDAY, view_count: 150 },
        ],
        [
          { recorded_at: TODAY, view_count: 50 },
          { recorded_at: YESTERDAY, view_count: 30 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 350,
        comparisonViews: 260,
        dailyViewsIncrease: 90,
      });
    });
  });

  describe("最新データが今日の場合の比較対象", () => {
    test("最新が今日で昨日のデータあり → 昨日と比較", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 500 },
          { recorded_at: YESTERDAY, view_count: 400 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 300 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 500,
        comparisonViews: 400,
        dailyViewsIncrease: 100,
      });
    });

    test("最新が今日で昨日のデータなし → 一昨日と比較", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 500 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 300 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 500,
        comparisonViews: 300,
        dailyViewsIncrease: 200,
      });
    });

    test("最新が今日で昨日も一昨日もなし → 比較対象なし", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 500 },
          { recorded_at: "2025-01-10", view_count: 100 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 500,
        comparisonViews: 0,
        dailyViewsIncrease: 500,
      });
    });
  });

  describe("最新データが昨日の場合の比較対象", () => {
    test("最新が昨日で一昨日のデータあり → 一昨日と比較", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: YESTERDAY, view_count: 400 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 300 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 400,
        comparisonViews: 300,
        dailyViewsIncrease: 100,
      });
    });

    test("最新が昨日で一昨日のデータなし → 比較対象なし", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: YESTERDAY, view_count: 400 },
          { recorded_at: "2025-01-10", view_count: 100 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 400,
        comparisonViews: 0,
        dailyViewsIncrease: 400,
      });
    });
  });

  describe("最新データが一昨日以前の場合", () => {
    test("最新が一昨日以前 → 比較対象なし（increase = totalViews）", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: "2025-01-10", view_count: 200 },
          { recorded_at: "2025-01-09", view_count: 150 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 200,
        comparisonViews: 0,
        dailyViewsIncrease: 200,
      });
    });
  });

  describe("空データの処理", () => {
    test("空の配列 → 全て0", () => {
      const result = calculateDailyViewsIncrease(
        [],
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 0,
        comparisonViews: 0,
        dailyViewsIncrease: 0,
      });
    });

    test("動画ごとのstatsが空配列 → スキップされる", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [],
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: 80 },
        ],
        [],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 100,
        comparisonViews: 80,
        dailyViewsIncrease: 20,
      });
    });
  });

  describe("null値の処理", () => {
    test("view_count が null → 0として扱う", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: null },
          { recorded_at: YESTERDAY, view_count: 50 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 0,
        comparisonViews: 50,
        dailyViewsIncrease: -50,
      });
    });

    test("比較対象の view_count が null → 0として扱う", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: null },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 100,
        comparisonViews: 0,
        dailyViewsIncrease: 100,
      });
    });

    test("両方 null → 全て0", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: TODAY, view_count: null },
          { recorded_at: YESTERDAY, view_count: null },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 0,
        comparisonViews: 0,
        dailyViewsIncrease: 0,
      });
    });
  });

  describe("ソート動作", () => {
    test("日付が順不同でも正しくソートして最新を取得する", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 300 },
          { recorded_at: TODAY, view_count: 500 },
          { recorded_at: YESTERDAY, view_count: 400 },
        ],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 500,
        comparisonViews: 400,
        dailyViewsIncrease: 100,
      });
    });

    test("元の配列を変更しない（イミュータブル）", () => {
      const originalStats: VideoStatsRecord[] = [
        { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 300 },
        { recorded_at: TODAY, view_count: 500 },
        { recorded_at: YESTERDAY, view_count: 400 },
      ];
      const allVideoStats = [originalStats];

      calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(originalStats[0].recorded_at).toBe(DAY_BEFORE_YESTERDAY);
      expect(originalStats[1].recorded_at).toBe(TODAY);
      expect(originalStats[2].recorded_at).toBe(YESTERDAY);
    });
  });

  describe("複数動画の混合ケース", () => {
    test("各動画の最新日付が異なる場合、それぞれ適切な比較対象を使う", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        // 動画1: 最新が今日 → 昨日と比較
        [
          { recorded_at: TODAY, view_count: 100 },
          { recorded_at: YESTERDAY, view_count: 80 },
        ],
        // 動画2: 最新が昨日 → 一昨日と比較
        [
          { recorded_at: YESTERDAY, view_count: 200 },
          { recorded_at: DAY_BEFORE_YESTERDAY, view_count: 150 },
        ],
        // 動画3: 最新が一昨日以前 → 比較対象なし
        [{ recorded_at: "2025-01-10", view_count: 50 }],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      // totalViews = 100 + 200 + 50 = 350
      // comparisonViews = 80 (動画1の昨日) + 150 (動画2の一昨日) + 0 (動画3比較なし) = 230
      expect(result).toEqual({
        totalViews: 350,
        comparisonViews: 230,
        dailyViewsIncrease: 120,
      });
    });

    test("空配列とnull値が混在するケース", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [],
        [
          { recorded_at: TODAY, view_count: null },
          { recorded_at: YESTERDAY, view_count: 100 },
        ],
        [
          { recorded_at: TODAY, view_count: 300 },
          { recorded_at: YESTERDAY, view_count: null },
        ],
        [],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      // totalViews = 0 (null) + 300 = 300
      // comparisonViews = 100 + 0 (null) = 100
      expect(result).toEqual({
        totalViews: 300,
        comparisonViews: 100,
        dailyViewsIncrease: 200,
      });
    });
  });

  describe("単一レコードの動画", () => {
    test("今日のレコードのみ → 比較対象なし", () => {
      const allVideoStats: VideoStatsRecord[][] = [
        [{ recorded_at: TODAY, view_count: 100 }],
      ];

      const result = calculateDailyViewsIncrease(
        allVideoStats,
        TODAY,
        YESTERDAY,
        DAY_BEFORE_YESTERDAY,
      );

      expect(result).toEqual({
        totalViews: 100,
        comparisonViews: 0,
        dailyViewsIncrease: 100,
      });
    });
  });
});
