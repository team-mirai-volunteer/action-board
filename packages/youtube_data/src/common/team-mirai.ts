/**
 * チームみらい関連のキーワード
 * 動画のタグ、タイトル、説明文にこれらのいずれかが含まれていればチームみらい動画と判定
 */
export const TEAM_MIRAI_KEYWORDS = [
  "チームみらい",
  "teammirai",
  "team mirai",
] as const;

/**
 * 動画のタグ、タイトル、説明文にチームみらい関連のキーワードが含まれているかチェック
 * @param tags 動画のタグ配列
 * @param title 動画のタイトル
 * @param description 動画の説明文
 */
export function hasTeamMiraiTag(
  tags: string[] | undefined,
  title?: string | null,
  description?: string | null,
): boolean {
  // タグをチェック
  if (tags && tags.length > 0) {
    const lowerTags = tags.map((tag) => tag.toLowerCase());
    const hasTag = TEAM_MIRAI_KEYWORDS.some((keyword) =>
      lowerTags.some((tag) => tag.includes(keyword.toLowerCase())),
    );
    if (hasTag) {
      return true;
    }
  }

  // タイトルをチェック
  if (title) {
    const lowerTitle = title.toLowerCase();
    if (
      TEAM_MIRAI_KEYWORDS.some((keyword) =>
        lowerTitle.includes(keyword.toLowerCase()),
      )
    ) {
      return true;
    }
  }

  // 説明文をチェック
  if (description) {
    const lowerDesc = description.toLowerCase();
    if (
      TEAM_MIRAI_KEYWORDS.some((keyword) =>
        lowerDesc.includes(keyword.toLowerCase()),
      )
    ) {
      return true;
    }
  }

  return false;
}
