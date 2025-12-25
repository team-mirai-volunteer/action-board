import "server-only";

import { getPartyMembership } from "@/features/party-membership/services/memberships";
import type { ActivityTimelineItem } from "@/features/user-activity/types/activity-types";
import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();

  const [achievementsResult, activitiesResult, userProfileResult] =
    await Promise.all([
      // Achievement query with optional season filter
      seasonId
        ? supabase
            .from("achievements")
            .select("id, created_at, user_id, missions!inner(title)")
            .eq("user_id", userId)
            .eq("season_id", seasonId)
            .order("created_at", { ascending: false })
            .range(offset, offset + Math.ceil(limit / 2) - 1)
        : supabase
            .from("achievements")
            .select("id, created_at, user_id, missions!inner(title)")
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

  // ミッション達成データを活動タイムライン形式に変換
  const achievements = (achievementsResult.data || []).map((a) => ({
    id: `achievement_${a.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: a.missions.title,
    created_at: a.created_at,
    activity_type: "mission_achievement",
    party_membership: partyMembership,
  }));

  // ユーザーアクティビティデータを活動タイムライン形式に変換
  const activities = (activitiesResult.data || []).map((a) => ({
    id: `activity_${a.id}`,
    user_id: userId,
    name: userProfile?.name || "",
    address_prefecture: userProfile?.address_prefecture || null,
    avatar_url: userProfile?.avatar_url || null,
    title: a.activity_title,
    created_at: a.created_at,
    activity_type: a.activity_type,
    party_membership: partyMembership,
  }));

  // 両方のデータを統合し、作成日時の降順でソートして指定件数まで取得
  return [...achievements, ...activities]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

export async function getUserActivityTimelineCount(
  userId: string,
  seasonId?: string,
): Promise<number> {
  const supabase = createClient();

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
