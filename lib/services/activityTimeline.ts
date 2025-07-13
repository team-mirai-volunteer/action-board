import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";

export interface ActivityTimelineItem {
  id: string;
  user_id: string;
  name: string;
  address_prefecture: string | null;
  avatar_url: string | null;
  title: string;
  created_at: string;
  activity_type: string;
}

export async function getUserActivityTimeline(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<ActivityTimelineItem[]> {
  const supabase = await createClient();

  const [achievementsResult, activitiesResult] = await Promise.all([
    supabase
      .from("achievements")
      .select(`
        id,
        created_at,
        public_user_profiles!inner (
          id,
          name,
          address_prefecture,
          avatar_url
        ),
        missions!inner (
          title
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + Math.ceil(limit / 2) - 1),

    supabase
      .from("user_activities")
      .select(`
        id,
        created_at,
        activity_title,
        activity_type,
        public_user_profiles!inner (
          id,
          name,
          address_prefecture,
          avatar_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + Math.ceil(limit / 2) - 1),
  ]);

  if (achievementsResult.error) {
    console.error("Failed to fetch achievements:", achievementsResult.error);
    throw new Error(
      `ミッション達成データの取得に失敗しました: ${achievementsResult.error.message}`,
    );
  }

  if (activitiesResult.error) {
    console.error("Failed to fetch user activities:", activitiesResult.error);
    throw new Error(
      `ユーザーアクティビティデータの取得に失敗しました: ${activitiesResult.error.message}`,
    );
  }

  const achievements = (achievementsResult.data || []).map((a) => ({
    id: `achievement_${a.id}`,
    user_id: userId,
    name: a.public_user_profiles.name,
    address_prefecture: a.public_user_profiles.address_prefecture,
    avatar_url: a.public_user_profiles.avatar_url,
    title: a.missions.title,
    created_at: a.created_at,
    activity_type: "mission_achievement",
  }));

  const activities = (activitiesResult.data || []).map((a) => ({
    id: `activity_${a.id}`,
    user_id: userId,
    name: a.public_user_profiles.name,
    address_prefecture: a.public_user_profiles.address_prefecture,
    avatar_url: a.public_user_profiles.avatar_url,
    title: a.activity_title,
    created_at: a.created_at,
    activity_type: a.activity_type,
  }));

  return [...achievements, ...activities]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);
}

export async function getUserActivityTimelineCount(
  userId: string,
): Promise<number> {
  const supabase = await createClient();

  const [achievementsCount, activitiesCount] = await Promise.all([
    supabase
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
