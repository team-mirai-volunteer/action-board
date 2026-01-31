/**
 * 日本時間（JST）関連のユーティリティ関数
 */

/** JST (UTC+9) のオフセット（ミリ秒） */
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 日本時間（JST）の今日の0時0分を取得する
 * UTC 15:00 = JST 00:00 のパターンを使用
 * badgeCalculation.tsと同じロジックを共通化
 */
export function getJSTMidnightToday(): Date {
  const now = new Date();

  // 日本時間の今日の0時を取得（UTC 15:00 = JST 00:00）
  const todayJST = new Date(now);
  todayJST.setUTCHours(15, 0, 0, 0);

  if (todayJST > now) {
    // まだ日本時間の0時になっていない場合は前日にする
    todayJST.setUTCDate(todayJST.getUTCDate() - 1);
  }

  return todayJST;
}

/**
 * UTCのDateオブジェクトをJSTの日付文字列(YYYY-MM-DD)に変換する
 */
export function toJstDateString(date: Date): string {
  const jstDate = new Date(date.getTime() + JST_OFFSET_MS);
  return jstDate.toISOString().split("T")[0];
}

/**
 * JSTで今日・昨日・一昨日の日付文字列を取得する
 */
export function getJstRecentDates(now: Date = new Date()): {
  today: string;
  yesterday: string;
  dayBeforeYesterday: string;
} {
  const DAY_MS = 86400000;
  return {
    today: toJstDateString(now),
    yesterday: toJstDateString(new Date(now.getTime() - DAY_MS)),
    dayBeforeYesterday: toJstDateString(new Date(now.getTime() - DAY_MS * 2)),
  };
}

/**
 * JSTで今日の日付文字列(YYYY-MM-DD)を取得する
 */
export function getTodayJstString(now: Date = new Date()): string {
  return toJstDateString(now);
}

/**
 * 日付配列から本日以降のデータを除外する
 * @param items - date プロパティを持つオブジェクトの配列
 * @param now - 基準日時（デフォルトは現在時刻）
 * @returns 本日より前のデータのみの配列
 */
export function filterBeforeToday<T extends { date: string }>(
  items: T[],
  now: Date = new Date(),
): T[] {
  const todayJst = toJstDateString(now);
  return items.filter((item) => item.date < todayJst);
}
