/**
 * ボーナスXP対象のミッションスラグ一覧
 */
export const BONUS_MISSION_SLUGS = [
  "posting-magazine",
  "put-up-poster-on-board",
  "posting-activity-magazine",
] as const;

/**
 * 指定されたスラグがボーナスXP対象ミッションかどうかを判定する
 */
export function isBonusMission(slug: string): boolean {
  return (BONUS_MISSION_SLUGS as readonly string[]).includes(slug);
}
