import type { LevelUpNotification } from "../types/level-types";
import { totalXp } from "./level-calculator";

/**
 * レベルアップ通知を表示すべきか判定する
 */
export function shouldShowLevelUpNotification(
  currentLevel: number,
  lastNotifiedLevel: number | null,
): boolean {
  const effectiveLastNotified = lastNotifiedLevel || 1;
  return currentLevel > effectiveLastNotified;
}

/**
 * レベルアップ通知データを構築する
 */
export function buildLevelUpNotificationData(
  currentLevel: number,
  lastNotifiedLevel: number | null,
  xp: number,
): LevelUpNotification {
  const effectiveLastNotified = lastNotifiedLevel || 1;
  const nextLevelPoints = totalXp(currentLevel + 1);
  const pointsToNextLevel = Math.max(0, nextLevelPoints - xp);

  return {
    shouldNotify: true,
    levelUp: {
      previousLevel: effectiveLastNotified,
      newLevel: currentLevel,
      pointsToNextLevel,
    },
  };
}
