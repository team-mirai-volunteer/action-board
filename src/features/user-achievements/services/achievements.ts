import "server-only";

import type { MissionAchievementSummary } from "@/features/user-achievements/types/achievement-types";
import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  aggregateAchievementCounts,
  buildAchievementMap,
} from "../utils/achievement-aggregation";

export async function getUserRepeatableMissionAchievements(
  userId: string,
  seasonId?: string,
): Promise<MissionAchievementSummary[]> {
  const supabase = await createAdminClient();

  let query = supabase
    .from("achievements")
    .select(`
      mission_id,
      missions!inner (
        id,
        slug,
        title,
        max_achievement_count
      )
    `)
    .eq("user_id", userId)
    .is("missions.max_achievement_count", null);

  // Add season filter if specified
  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch user mission achievements:", error);
    return [];
  }

  if (!data) return [];

  return aggregateAchievementCounts(
    data as Parameters<typeof aggregateAchievementCounts>[0],
  );
}

/**
 * ユーザーのミッション達成情報を取得し、ミッションIDごとの達成回数をMapで返す
 */
export async function getUserMissionAchievements(
  userId: string,
): Promise<Map<string, number>> {
  const supabase = await createAdminClient();

  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("mission_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user achievements:", error);
    throw error;
  }

  return buildAchievementMap(achievements ?? []);
}
