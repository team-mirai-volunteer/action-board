import type { PartyMembership } from "@/features/party-membership/types";
import type { ActivityTimelineItem } from "@/features/user-activity/types/activity-types";

/**
 * ミッション達成データのraw型
 */
interface AchievementRow {
  id: string;
  created_at: string;
  user_id: string | null;
  mission_id: string | null;
  missions: {
    title: string;
    slug: string;
  };
}

/**
 * ユーザーアクティビティデータのraw型
 */
interface ActivityRow {
  id: string;
  created_at: string;
  activity_title: string;
  activity_type: string;
  user_id: string | null;
}

/**
 * ユーザープロフィール情報（タイムライン変換用）
 */
interface UserProfileInfo {
  name: string;
  address_prefecture: string | null;
  avatar_url: string | null;
}

/**
 * 単一のミッション達成データを活動タイムライン形式に変換する
 */
export function mapAchievementToTimeline(
  achievement: AchievementRow,
  userId: string,
  userProfile: UserProfileInfo | null,
  partyMembership: PartyMembership | null,
): ActivityTimelineItem {
  return {
    id: `achievement_${achievement.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: achievement.missions.title,
    mission_id: achievement.mission_id,
    mission_slug: achievement.missions.slug,
    created_at: achievement.created_at,
    activity_type: "mission_achievement",
    party_membership: partyMembership,
  };
}

/**
 * ミッション達成データを活動タイムライン形式に変換する
 */
export function mapAchievementsToTimeline(
  achievements: AchievementRow[],
  userId: string,
  userProfile: UserProfileInfo | null,
  partyMembership: PartyMembership | null,
): ActivityTimelineItem[] {
  return achievements.map((a) =>
    mapAchievementToTimeline(a, userId, userProfile, partyMembership),
  );
}

/**
 * 単一のユーザーアクティビティデータを活動タイムライン形式に変換する
 */
export function mapActivityToTimeline(
  activity: ActivityRow,
  userId: string,
  userProfile: UserProfileInfo | null,
  partyMembership: PartyMembership | null,
): ActivityTimelineItem {
  return {
    id: `activity_${activity.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: activity.activity_title,
    mission_id: null,
    mission_slug: null,
    created_at: activity.created_at,
    activity_type: activity.activity_type,
    party_membership: partyMembership,
  };
}

/**
 * ユーザーアクティビティデータを活動タイムライン形式に変換する
 */
export function mapActivitiesToTimeline(
  activities: ActivityRow[],
  userId: string,
  userProfile: UserProfileInfo | null,
  partyMembership: PartyMembership | null,
): ActivityTimelineItem[] {
  return activities.map((a) =>
    mapActivityToTimeline(a, userId, userProfile, partyMembership),
  );
}

/**
 * 複数のタイムラインアイテム配列をマージし、作成日時の降順でソートして指定件数まで取得する
 */
export function mergeAndSortTimeline(
  ...args: [...ActivityTimelineItem[][], number]
): ActivityTimelineItem[] {
  const limit = args[args.length - 1] as number;
  const arrays = args.slice(0, -1) as ActivityTimelineItem[][];
  return arrays
    .flat()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

/**
 * タイムラインアイテム配列から有効なユーザーIDを抽出する
 */
export function extractValidUserIds(
  items: Array<{ user_id?: string | null }>,
): string[] {
  return items
    .map((item) => item.user_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

/**
 * タイムラインアイテムにパーティメンバーシップ情報を付与する
 */
export function enrichTimelineItemsWithMemberships(
  items: Array<{
    id: string | null;
    user_id: string | null;
    name: string | null;
    address_prefecture: string | null;
    avatar_url: string | null;
    title: string | null;
    mission_id: string | null;
    mission_slug?: unknown;
    created_at: string | null;
    activity_type: string | null;
  }>,
  membershipMap: Record<string, PartyMembership>,
): ActivityTimelineItem[] {
  return items.map((item) => ({
    id: item.id ?? "",
    user_id: item.user_id ?? "",
    name: item.name ?? "",
    address_prefecture: item.address_prefecture,
    avatar_url: item.avatar_url,
    title: item.title ?? "",
    mission_id: item.mission_id,
    mission_slug:
      item.mission_slug != null &&
      typeof item.mission_slug === "string" &&
      item.mission_slug
        ? item.mission_slug
        : null,
    created_at: item.created_at ?? "",
    activity_type: item.activity_type ?? "",
    party_membership:
      item.user_id && membershipMap[item.user_id]
        ? membershipMap[item.user_id]
        : null,
  }));
}
