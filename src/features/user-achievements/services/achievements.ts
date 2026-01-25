import "server-only";

import type { MissionAchievementSummary } from "@/features/user-achievements/types/achievement-types";
import { createClient } from "@/lib/supabase/client";

export async function getUserRepeatableMissionAchievements(
  userId: string,
  seasonId?: string,
): Promise<MissionAchievementSummary[]> {
  const supabase = createClient();

  let query = supabase
    .from("achievements")
    .select(`
      mission_id,
      missions!inner (
        id,
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

  const achievementCounts = data.reduce(
    (acc, achievement) => {
      const missionId = achievement.mission_id;
      if (!missionId || !achievement.missions) return acc;

      if (!acc[missionId]) {
        acc[missionId] = {
          mission_id: missionId,
          mission_title: achievement.missions.title,
          achievement_count: 0,
        };
      }
      acc[missionId].achievement_count += 1;
      return acc;
    },
    {} as Record<string, MissionAchievementSummary>,
  );

  return Object.values(achievementCounts).filter(
    (achievement) => achievement.achievement_count > 0,
  );
}

/**
 * ユーザーのミッション達成情報を取得し、ミッションIDごとの達成回数をMapで返す
 */
export async function getUserMissionAchievements(
  userId: string,
): Promise<Map<string, number>> {
  const supabase = createClient();

  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("mission_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user achievements:", error);
    throw error;
  }

  const achievementMap = new Map<string, number>();
  for (const achievement of achievements ?? []) {
    if (achievement.mission_id) {
      const current = achievementMap.get(achievement.mission_id) ?? 0;
      achievementMap.set(achievement.mission_id, current + 1);
    }
  }

  return achievementMap;
}
