/**
 * チームみらい関連のタグパターン
 * 動画のタグにこれらのいずれかが含まれていればチームみらい動画と判定
 */
export const TEAM_MIRAI_TAGS = [
  "チームみらい",
  "teammirai",
  "team mirai",
] as const;

/**
 * 動画のタグにチームみらい関連のタグが含まれているかチェック
 * @param tags 動画のタグ配列
 */
export function hasTeamMiraiTag(tags: string[] | undefined): boolean {
  if (!tags || tags.length === 0) {
    return false;
  }
  const lowerTags = tags.map((tag) => tag.toLowerCase());
  return TEAM_MIRAI_TAGS.some((tmTag) =>
    lowerTags.some((tag) => tag.includes(tmTag.toLowerCase())),
  );
}
