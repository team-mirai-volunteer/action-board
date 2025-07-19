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
  return Math.floor((completedCount / registeredCount) * 100);
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
 * 他党のポスター貼付状態（error_wrong_poster）は進捗率計算の分母から除外
 * @param statusCounts ステータス別の統計
 * @returns 登録済み掲示板数（error_wrong_posterを除く）
 */
export function getRegisteredCount(
  statusCounts: Record<BoardStatus, number>,
): number {
  return Object.entries(statusCounts)
    .filter(([status]) => status !== "error_wrong_poster")
    .reduce((sum, [, count]) => sum + count, 0);
}
