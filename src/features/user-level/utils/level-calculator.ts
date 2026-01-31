// L → L+1 の差分 XP
export const xpDelta = (L: number) => {
  if (L < 1) throw new Error("Level must be at least 1");
  return 40 + 15 * (L - 1);
};

// レベル L 到達までの累計 XP
export const totalXp = (L: number) => {
  if (L < 1) throw new Error("Level must be at least 1");
  return (L - 1) * (25 + (15 / 2) * L);
};

/**
 * XPに基づくレベル計算
 * 新しい式に基づく逆算
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;

  // 最大レベルを設定（計算の無限ループを防ぐため）
  const maxLevel = 1000;

  for (let level = 1; level <= maxLevel; level++) {
    const requiredXp = totalXp(level + 1);
    if (xp < requiredXp) {
      return level;
    }
  }

  return maxLevel;
}

/**
 * ミッションの難易度に基づいてXPを計算する
 * @param difficulty - 難易度（1-5）
 * @param isFeatured - 注目ミッションかどうか（2倍ボーナス）
 */
export function calculateMissionXp(
  difficulty: number,
  isFeatured = false,
): number {
  let baseXp: number;
  switch (difficulty) {
    case 1:
      baseXp = 50; // ★1
      break;
    case 2:
      baseXp = 100; // ★2
      break;
    case 3:
      baseXp = 200; // ★3
      break;
    case 4:
      baseXp = 400; // ★4
      break;
    case 5:
      baseXp = 800; // ★5
      break;
    default:
      baseXp = 50; // デフォルト（Easy相当）
  }
  return isFeatured ? baseXp * 2 : baseXp;
}

/**
 * 次のレベルまでに必要なXP計算
 */
export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelTotalXp = totalXp(currentLevel + 1);
  return Math.max(0, nextLevelTotalXp - currentXp);
}

/**
 * 現在レベルでの進捗率計算（0-1の値）
 */
export function getLevelProgress(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const xpToNext = getXpToNextLevel(currentXp);
  const levelXpRange = xpDelta(currentLevel);
  return Math.max(0, Math.min(1, (levelXpRange - xpToNext) / levelXpRange));
}
