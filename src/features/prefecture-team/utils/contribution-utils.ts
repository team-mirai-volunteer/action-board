/**
 * ユーザーXPの都道府県合計XPに対する貢献パーセントを計算する
 */
export function calculateContributionPercent(
  userXp: number,
  totalXp: number,
): number {
  if (totalXp <= 0) {
    return 0;
  }
  return (userXp / totalXp) * 100;
}
