/**
 * 動画統計の日次増加数を計算するユーティリティ
 * 純粋関数として実装し、ユニットテスト可能にする
 */

export interface VideoStatsRecord {
  recorded_at: string; // JST日付文字列 "YYYY-MM-DD"
  view_count: number | null;
  like_count?: number | null;
  comment_count?: number | null;
  share_count?: number | null;
}

export interface DailyIncreaseResult {
  totalViews: number;
  comparisonViews: number;
  dailyViewsIncrease: number;
}

/**
 * 各動画の統計データから日次増加数を計算する
 *
 * ロジック:
 * 1. 各動画の最新統計を合計して totalViews を算出
 * 2. 各動画について、最新統計の「前日」の統計を探して合計
 *    - 最新が今日 → 昨日を探す、なければ一昨日
 *    - 最新が昨日 → 一昨日を探す
 *    - 最新が一昨日以前 → 比較対象なし
 * 3. totalViews - comparisonViews で増加数を算出
 *
 * @param allVideoStats 動画ごとの統計レコード配列の配列
 * @param today 今日のJST日付文字列
 * @param yesterday 昨日のJST日付文字列
 * @param dayBeforeYesterday 一昨日のJST日付文字列
 */
export function calculateDailyViewsIncrease(
  allVideoStats: VideoStatsRecord[][],
  today: string,
  yesterday: string,
  dayBeforeYesterday: string,
): DailyIncreaseResult {
  let totalViews = 0;
  let comparisonViews = 0;

  for (const videoStats of allVideoStats) {
    if (videoStats.length === 0) continue;

    // 日付降順でソート（最新が先頭）
    const sortedStats = [...videoStats].sort((a, b) =>
      b.recorded_at.localeCompare(a.recorded_at),
    );

    const latestStats = sortedStats[0];
    totalViews += latestStats.view_count ?? 0;

    // 最新統計の日付に応じて比較対象の日付を決定
    const latestDate = latestStats.recorded_at;
    let comparisonDates: string[];

    if (latestDate === today) {
      // 最新が今日 → 昨日優先、なければ一昨日
      comparisonDates = [yesterday, dayBeforeYesterday];
    } else if (latestDate === yesterday) {
      // 最新が昨日 → 一昨日のみ
      comparisonDates = [dayBeforeYesterday];
    } else {
      // 最新が一昨日以前 → 比較対象なし
      comparisonDates = [];
    }

    // 比較対象を探す
    for (const targetDate of comparisonDates) {
      const compStats = sortedStats.find((s) => s.recorded_at === targetDate);
      if (compStats) {
        comparisonViews += compStats.view_count ?? 0;
        break;
      }
    }
  }

  return {
    totalViews,
    comparisonViews,
    dailyViewsIncrease: totalViews - comparisonViews,
  };
}
