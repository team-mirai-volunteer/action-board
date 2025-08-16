import type { UserBadge } from "../badge-types";
import { getUserBadges } from "./get-user-badges";

/**
 * ユーザーの最高ランクのバッジを取得（ミッション情報付き）
 */
export async function getUserTopBadge(
  userId: string,
  seasonId?: string,
): Promise<UserBadge | null> {
  const badges = await getUserBadges(userId, seasonId);

  if (badges.length === 0) {
    return null;
  }

  // ランクが最も高い（数値が小さい）バッジを返す
  return badges.reduce((topBadge, currentBadge) =>
    currentBadge.rank < topBadge.rank ? currentBadge : topBadge,
  );
}
