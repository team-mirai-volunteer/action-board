import type { BoardStatus } from "@/lib/types/poster-boards";

/**
 * 進捗率を計算する
 * @param completedCount 完了数
 * @param registeredCount 登録済み掲示板数
 * @returns 進捗率（パーセント）
 */
export function calculateProgressRate(
  completedCount: number,
  registeredCount: number,
): number {
  if (registeredCount === 0) return 0;
  return Math.round((completedCount / registeredCount) * 100);
}

/**
 * ステータス別の統計から完了数を取得
 * @param statusCounts ステータス別の統計
 * @returns 完了数
 */
export function getCompletedCount(
  statusCounts: Record<BoardStatus, number>,
): number {
  return statusCounts.done || 0;
}

/**
 * ステータス別の統計から登録済み掲示板数を取得
 * @param statusCounts ステータス別の統計
 * @returns 登録済み掲示板数
 */
export function getRegisteredCount(
  statusCounts: Record<BoardStatus, number>,
): number {
  return Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
}
