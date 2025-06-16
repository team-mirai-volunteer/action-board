import "server-only";

import { createClient as createServerClient } from "@/lib/supabase/server";

export interface MissionAchievementSummary {
  mission_id: string;
  mission_title: string;
  achievement_count: number;
}

export async function getUserMissionAchievements(
  userId: string,
): Promise<MissionAchievementSummary[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
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

    if (error) {
      console.error("Failed to fetch user mission achievements:", error);
      throw new Error(
        `ユーザーのミッション達成状況の取得に失敗しました: ${error.message}`,
      );
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
  } catch (error) {
    console.error("User mission achievements service error:", error);
    return [];
  }
}
