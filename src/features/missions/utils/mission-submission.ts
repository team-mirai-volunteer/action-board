/**
 * ミッション提出状態を計算する純粋関数。
 * max_achievement_countとユーザーの達成回数から、ボタンラベル・無効状態・達成上限到達を返す。
 */
export function getMissionSubmissionState(
  maxAchievementCount: number | null,
  userAchievementCount: number,
): {
  buttonLabel: string;
  isButtonDisabled: boolean;
  hasReachedUserMaxAchievements: boolean;
} {
  const hasReachedMax =
    maxAchievementCount !== null && userAchievementCount >= maxAchievementCount;

  return {
    buttonLabel: hasReachedMax
      ? "このミッションは完了済みです"
      : "ミッション完了を記録する",
    isButtonDisabled: hasReachedMax,
    hasReachedUserMaxAchievements: hasReachedMax,
  };
}
