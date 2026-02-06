/**
 * メンテナンスモード判定ユーティリティ
 */

export const MAINTENANCE_START_AT = new Date("2026-02-07T23:59:00+09:00");

/**
 * メンテナンス開始時刻を過ぎているかを判定する。
 */
export function isMaintenanceActive(now: Date = new Date()): boolean {
  return now >= MAINTENANCE_START_AT;
}

/**
 * previewパラメータでメンテナンス画面を強制表示するかを判定する。
 */
export function isMaintenancePreview(url: URL): boolean {
  return url.searchParams.get("preview") === "maintenance";
}

/**
 * メンテナンス画面を表示すべきかを判定する。
 */
export function shouldShowMaintenance(
  url: URL,
  now: Date = new Date(),
): boolean {
  return isMaintenanceActive(now) || isMaintenancePreview(url);
}
