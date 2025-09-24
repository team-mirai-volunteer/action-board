/**
 * 境界時刻チェックユーティリティ
 *
 * このコンポーネントは投開票日当日のサービス停止時に使用されました。
 * アクションボードのサービスの一時停止措置として実装されています。
 *
 */

export function isAfterSwitchTime(): boolean {
  const now = new Date();
  const switchTime = new Date("2025-07-20T00:00:00+09:00");
  return now >= switchTime;
}
