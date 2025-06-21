import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";

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

export async function checkAndRecordDailyAttempt(
  userId: string,
  missionId: string,
): Promise<DailyAttemptResult> {
  const supabase = await createServiceClient();

  const { data: missionData, error: missionError } = await supabase
    .from("missions")
    .select("daily_attempt_limit")
    .eq("id", missionId)
    .single();

  if (missionError) {
    console.error("Failed to fetch mission daily limit:", missionError);
    return { canAttempt: false, currentAttempts: 0, dailyLimit: null };
  }

  const dailyLimit = missionData?.daily_attempt_limit;

  if (dailyLimit === null) {
    return { canAttempt: true, currentAttempts: 0, dailyLimit: null };
  }

  const today = new Date().toISOString().split("T")[0];

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

  const { error: upsertError } = await supabase
    .from("daily_mission_attempts")
    .upsert(
      {
        user_id: userId,
        mission_id: missionId,
        attempt_date: today,
        attempt_count: currentAttempts + 1,
      },
      {
        onConflict: "user_id,mission_id,attempt_date",
      },
    );

  if (upsertError) {
    console.error("Failed to record daily attempt:", upsertError);
    return { canAttempt: false, currentAttempts, dailyLimit };
  }

  return { canAttempt: true, currentAttempts: currentAttempts + 1, dailyLimit };
}
