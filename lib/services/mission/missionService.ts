import "server-only";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Mission } from "@/lib/types/domain";

export async function getMissionById(id: string): Promise<Mission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Mission fetch error: ${error.message}`);
    return null;
  }

  return data;
}

export async function hasFeaturedMissions(): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true);

  return !!count;
}

export async function getUserMissionAchievementCount(
  userId: string,
  missionId: string,
): Promise<number> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("id", { count: "exact" })
    .eq("user_id", userId)
    .eq("mission_id", missionId);

  if (error) {
    console.error(`User achievement count fetch error: ${error.message}`);
    return 0;
  }

  return data?.length || 0;
}

export async function checkMissionAchievementLimit(
  userId: string,
  missionId: string,
): Promise<{ canAchieve: boolean; error?: string }> {
  const mission = await getMissionById(missionId);

  if (!mission) {
    return { canAchieve: false, error: "ミッション情報の取得に失敗しました。" };
  }

  if (mission.max_achievement_count === null) {
    return { canAchieve: true };
  }

  const achievementCount = await getUserMissionAchievementCount(
    userId,
    missionId,
  );

  if (achievementCount >= mission.max_achievement_count) {
    return {
      canAchieve: false,
      error: "あなたはこのミッションの達成回数の上限に達しています。",
    };
  }

  return { canAchieve: true };
}
