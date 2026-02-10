import "server-only";

import {
  getPartyMembership,
  getPartyMembershipMap,
} from "@/features/party-membership/services/memberships";
import type { ActivityTimelineItem } from "@/features/user-activity/types/activity-types";
import {
  enrichTimelineItemsWithMemberships,
  extractValidUserIds,
  mapAchievementsToTimeline,
  mapActivitiesToTimeline,
  mergeAndSortTimeline,
} from "@/features/user-activity/utils/timeline-transforms";
import { createAdminClient } from "@/lib/supabase/adminClient";

/**
 * ユーザーの活動タイムラインを取得する
 * ミッション達成とユーザーアクティビティを統合して時系列順に返す
 * @param userId - 対象ユーザーのID
 * @param limit - 取得する最大件数（デフォルト: 20）
 * @param offset - 取得開始位置（デフォルト: 0）
 * @param seasonId - 特定シーズンの活動のみ取得する場合のシーズンID（オプション）
 * @returns 活動タイムラインアイテムの配列
 */
export async function getUserActivityTimeline(
  userId: string,
  limit = 20,
  offset = 0,
  seasonId?: string,
): Promise<ActivityTimelineItem[]> {
  const supabase = await createAdminClient();

  const [achievementsResult, activitiesResult, userProfileResult] =
    await Promise.all([
      // Achievement query with optional season filter
      seasonId
        ? supabase
            .from("achievements")
            .select(
              "id, created_at, user_id, mission_id, missions!inner(title, slug)",
            )
            .eq("user_id", userId)
            .eq("season_id", seasonId)
            .order("created_at", { ascending: false })
            .range(offset, offset + Math.ceil(limit / 2) - 1)
        : supabase
            .from("achievements")
            .select(
              "id, created_at, user_id, mission_id, missions!inner(title, slug)",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(offset, offset + Math.ceil(limit / 2) - 1),

      supabase
        .from("user_activities")
        .select("id, created_at, activity_title, activity_type, user_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + Math.ceil(limit / 2) - 1),

      supabase
        .from("public_user_profiles")
        .select("id, name, address_prefecture, avatar_url")
        .eq("id", userId)
        .single(),
    ]);

  // ミッション達成データの取得エラーハンドリング
  if (achievementsResult.error) {
    console.error("Failed to fetch achievements:", achievementsResult.error);
    return [];
  }

  // ユーザーアクティビティデータの取得エラーハンドリング
  if (activitiesResult.error) {
    console.error("Failed to fetch user activities:", activitiesResult.error);
    return [];
  }

  const userProfile = userProfileResult.data;
  const partyMembership = await getPartyMembership(userId);

  const achievements = mapAchievementsToTimeline(
    achievementsResult.data || [],
    userId,
    userProfile,
    partyMembership,
  );

  const activities = mapActivitiesToTimeline(
    activitiesResult.data || [],
    userId,
    userProfile,
    partyMembership,
  );

  return mergeAndSortTimeline(achievements, activities, limit);
}

export async function getUserActivityTimelineCount(
  userId: string,
  seasonId?: string,
): Promise<number> {
  const supabase = await createAdminClient();

  const [achievementsCount, activitiesCount] = await Promise.all([
    // Achievement count with optional season filter
    seasonId
      ? supabase
          .from("achievements")
          .select("*", { count: "exact" })
          .eq("user_id", userId)
          .eq("season_id", seasonId)
      : supabase
          .from("achievements")
          .select("*", { count: "exact" })
          .eq("user_id", userId),
    supabase
      .from("user_activities")
      .select("*", { count: "exact" })
      .eq("user_id", userId),
  ]);

  return (achievementsCount.count || 0) + (activitiesCount.count || 0);
}

/**
 * 全体の活動タイムラインを取得する（全ユーザー対象）
 * @param limit - 取得する最大件数
 * @param offset - 取得開始位置（デフォルト: 0）
 * @returns パーティメンバーシップ付きの活動タイムラインアイテムの配列
 */
export async function getGlobalActivityTimeline(
  limit: number,
  offset = 0,
): Promise<ActivityTimelineItem[]> {
  const supabase = await createAdminClient();

  const { data: activityTimelines } = await supabase
    .from("activity_timeline_view")
    .select()
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const items = activityTimelines ?? [];
  const userIds = extractValidUserIds(items);
  const membershipMap = await getPartyMembershipMap(userIds);

  return enrichTimelineItemsWithMemberships(items, membershipMap);
}

/**
 * 全体の活動タイムラインの総数を取得する
 * @returns 活動タイムラインの総数
 */
export async function getGlobalActivityTimelineCount(): Promise<number> {
  const supabase = await createAdminClient();

  const { count } = await supabase
    .from("activity_timeline_view")
    .select("*", { count: "exact", head: true });

  return count || 0;
}
