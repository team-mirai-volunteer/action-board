import type { BatchXpTransaction, UserLevel } from "../types/level-types";
import { calculateLevel } from "./level-calculator";

/**
 * バッチトランザクションからユーザーごとのXP合計を集計する
 */
export function aggregateXpByUser(
  transactions: BatchXpTransaction[],
): Map<string, number> {
  const userXpUpdates = new Map<string, number>();

  for (const transaction of transactions) {
    const currentTotal = userXpUpdates.get(transaction.userId) || 0;
    userXpUpdates.set(transaction.userId, currentTotal + transaction.xpAmount);
  }

  return userXpUpdates;
}

/**
 * ユーザーごとのXP変動から、レベル更新データと結果を構築する
 */
export function buildLevelUpdates(
  userXpChanges: Map<string, number>,
  levelMap: Map<string, UserLevel>,
  seasonId: string,
): {
  levelUpdates: Array<{
    user_id: string;
    season_id: string;
    xp: number;
    level: number;
    updated_at: string;
  }>;
  results: Array<{
    userId: string;
    success: boolean;
    error?: string;
    newXp?: number;
    newLevel?: number;
  }>;
} {
  const levelUpdates: Array<{
    user_id: string;
    season_id: string;
    xp: number;
    level: number;
    updated_at: string;
  }> = [];

  const results: Array<{
    userId: string;
    success: boolean;
    error?: string;
    newXp?: number;
    newLevel?: number;
  }> = [];

  for (const [userId, xpChange] of Array.from(userXpChanges.entries())) {
    const currentLevel = levelMap.get(userId);
    if (!currentLevel) {
      results.push({
        userId,
        success: false,
        error: "ユーザーレベル情報が見つかりません",
      });
      continue;
    }

    const newXp = currentLevel.xp + xpChange;
    const newLevel = calculateLevel(newXp);

    levelUpdates.push({
      user_id: userId,
      season_id: seasonId,
      xp: newXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    });

    results.push({
      userId,
      success: true,
      newXp,
      newLevel,
    });
  }

  return { levelUpdates, results };
}
