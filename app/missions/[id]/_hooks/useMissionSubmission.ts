"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import { useEffect, useMemo, useState } from "react";

export function useMissionSubmission(
  mission: Tables<"missions">,
  userAchievementCount: number,
) {
  const buttonLabel = useMemo(() => {
    if (
      mission.max_achievement_count !== null &&
      userAchievementCount >= mission.max_achievement_count
    ) {
      return "このミッションは完了済みです";
    }
    return "ミッション完了を記録する";
  }, [mission.max_achievement_count, userAchievementCount]);

  const isButtonDisabled = useMemo(() => {
    return (
      mission.max_achievement_count !== null &&
      userAchievementCount >= mission.max_achievement_count
    );
  }, [mission.max_achievement_count, userAchievementCount]);

  const hasReachedUserMaxAchievements = useMemo(() => {
    return (
      mission.max_achievement_count !== null &&
      userAchievementCount >= mission.max_achievement_count
    );
  }, [mission.max_achievement_count, userAchievementCount]);

  return {
    buttonLabel,
    isButtonDisabled,
    hasReachedUserMaxAchievements,
  };
}

export function useDailyAttemptStatus(
  missionId: string,
  userId: string | null,
) {
  const [dailyAttemptStatus, setDailyAttemptStatus] = useState<{
    currentAttempts: number;
    dailyLimit: number | null;
    hasReachedLimit: boolean;
  }>({
    currentAttempts: 0,
    dailyLimit: null,
    hasReachedLimit: false,
  });

  useEffect(() => {
    if (!userId || !missionId) return;

    const fetchDailyAttemptStatus = async () => {
      const supabase = createClient();

      const { data: missionData } = await supabase
        .from("missions")
        .select("daily_attempt_limit")
        .eq("id", missionId)
        .single();

      const dailyLimit = missionData?.daily_attempt_limit ?? null;

      if (dailyLimit === null) {
        setDailyAttemptStatus({
          currentAttempts: 0,
          dailyLimit: null,
          hasReachedLimit: false,
        });
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      const { data: attemptData } = await supabase
        .from("daily_mission_attempts")
        .select("attempt_count")
        .eq("user_id", userId)
        .eq("mission_id", missionId)
        .eq("attempt_date", today)
        .single();

      const currentAttempts = attemptData?.attempt_count || 0;

      setDailyAttemptStatus({
        currentAttempts,
        dailyLimit,
        hasReachedLimit: currentAttempts >= dailyLimit,
      });
    };

    fetchDailyAttemptStatus();
  }, [missionId, userId]);

  return dailyAttemptStatus;
}
