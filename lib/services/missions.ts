import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";
import { getTodayInJST } from "@/lib/utils/utils";


export type Mission = Tables<"missions">;

export async function hasFeaturedMissions(): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true);

  return !!count;
}

export interface DailyAttemptResult {
  canAttempt: boolean;
  currentAttempts: number;
  dailyLimit: number | null;
}

export type DailyAttemptStatusResult = {
  currentAttempts: number;
  dailyLimit: number | null;
  hasReachedLimit: boolean;
};

export async function checkAndRecordDailyAttempt(
  userId: string,
  missionId: string,
): Promise<DailyAttemptResult> {
  const supabase = await createServiceClient();

  const { getMissionData } = await import("@/app/missions/[id]/_lib/data");
  const missionData = await getMissionData(missionId);

  if (!missionData) {
    console.error("Failed to fetch mission daily limit: Mission not found");
    return { canAttempt: false, currentAttempts: 0, dailyLimit: null };
  }

  const dailyLimit = missionData?.max_daily_achievement_count;

  if (dailyLimit === null) {
    return { canAttempt: true, currentAttempts: 0, dailyLimit: null };
  }

  const today = getTodayInJST();

  const { data: existingAttempt, error: fetchError } = await supabase
    .from("daily_mission_attempts")
    .select("attempt_count")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .eq("attempt_date", today)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Failed to fetch daily attempts:", fetchError);
    return { canAttempt: false, currentAttempts: 0, dailyLimit };
  }

  const currentAttempts = existingAttempt?.attempt_count || 0;

  if (currentAttempts >= dailyLimit) {
    return { canAttempt: false, currentAttempts, dailyLimit };
  }

  const newAttemptCount = currentAttempts + 1;

  const { error: upsertError } = await supabase
    .from("daily_mission_attempts")
    .upsert(
      {
        user_id: userId,
        mission_id: missionId,
        attempt_date: today,
        attempt_count: newAttemptCount,
      },
      {
        onConflict: "user_id,mission_id,attempt_date",
      },
    );

  if (upsertError) {
    console.error("Failed to record daily attempt:", upsertError);
    return { canAttempt: false, currentAttempts, dailyLimit };
  }

  return { canAttempt: true, currentAttempts: newAttemptCount, dailyLimit };
}

export async function decrementDailyAttempt(
  userId: string,
  missionId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServiceClient();

  const { getMissionData } = await import("@/app/missions/[id]/_lib/data");
  const missionData = await getMissionData(missionId);

  if (!missionData) {
    console.error("Failed to fetch mission daily limit: Mission not found");
    return { success: false, error: "ミッション情報の取得に失敗しました" };
  }

  const dailyLimit = missionData?.max_daily_achievement_count;

  if (dailyLimit === null) {
    return { success: true };
  }

  const today = getTodayInJST();

  const { data: existingAttempt, error: fetchError } = await supabase
    .from("daily_mission_attempts")
    .select("attempt_count")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .eq("attempt_date", today)
    .single();

  if (fetchError) {
    console.error("Failed to fetch daily attempts:", fetchError);
    return { success: false, error: "日次挑戦記録の取得に失敗しました" };
  }

  const currentAttempts = existingAttempt?.attempt_count || 0;

  if (currentAttempts <= 0) {
    return { success: true };
  }

  const { error: updateError } = await supabase
    .from("daily_mission_attempts")
    .update({ attempt_count: currentAttempts - 1 })
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .eq("attempt_date", today);

  if (updateError) {
    console.error("Failed to decrement daily attempt:", updateError);
    return { success: false, error: "日次挑戦回数の減算に失敗しました" };
  }

  return { success: true };
}

export async function fetchDailyAttemptStatus(
  userId: string,
  missionId: string,
): Promise<DailyAttemptStatusResult> {
  const { getMissionData } = await import("@/app/missions/[id]/_lib/data");
  const missionData = await getMissionData(missionId);

  const dailyLimit = missionData?.max_daily_achievement_count ?? null;

  if (dailyLimit === null) {
    return {
      currentAttempts: 0,
      dailyLimit: null,
      hasReachedLimit: false,
    };
  }

  const today = getTodayInJST();

  const supabase = await createServiceClient();
  const { data: attemptData } = await supabase
    .from("daily_mission_attempts")
    .select("attempt_count")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .eq("attempt_date", today)
    .single();

  const currentAttempts = attemptData?.attempt_count || 0;
  const hasReachedLimit = currentAttempts >= dailyLimit;

  return {
    currentAttempts,
    dailyLimit,
    hasReachedLimit,
  };
}
