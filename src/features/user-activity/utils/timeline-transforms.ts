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
 * ミッション達成データを活動タイムライン形式に変換する
 */
export function mapAchievementsToTimeline(
  achievements: AchievementRow[],
  userId: string,
  userProfile: UserProfileInfo | null,
  partyMembership: PartyMembership | null,
): ActivityTimelineItem[] {
  return achievements.map((a) => ({
    id: `achievement_${a.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: a.missions.title,
    mission_id: a.mission_id,
    mission_slug: a.missions.slug,
    created_at: a.created_at,
    activity_type: "mission_achievement",
    party_membership: partyMembership,
  }));
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
  return activities.map((a) => ({
    id: `activity_${a.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: a.activity_title,
    mission_id: null,
    mission_slug: null,
    created_at: a.created_at,
    activity_type: a.activity_type,
    party_membership: partyMembership,
  }));
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
