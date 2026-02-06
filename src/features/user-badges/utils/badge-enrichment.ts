import type { UserBadge } from "../badge-types";

/**
 * ミッションバッジにタイトルとID情報をマッピングする純粋関数
 */
export function mapMissionDataToBadges(
  badges: UserBadge[],
  missionMap: Map<string, { title: string; id: string }>,
): UserBadge[] {
  return badges.map((badge) => {
    if (badge.badge_type === "MISSION" && badge.sub_type) {
      const missionInfo = missionMap.get(badge.sub_type);
      if (missionInfo) {
        return {
          ...badge,
          mission_title: missionInfo.title,
          mission_id: missionInfo.id,
        };
      }
    }
    return badge;
  });
}
