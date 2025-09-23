/**
 * 日本時間（JST）関連のユーティリティ関数
 */

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
