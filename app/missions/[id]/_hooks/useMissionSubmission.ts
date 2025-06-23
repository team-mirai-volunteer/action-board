"use client";

import {
  type DailyAttemptStatusResult,
  fetchDailyAttemptStatus,
} from "@/lib/services/missions";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  initialStatus?: DailyAttemptStatusResult,
) {
  const [dailyAttemptStatus, setDailyAttemptStatus] =
    useState<DailyAttemptStatusResult>(
      initialStatus || {
        currentAttempts: 0,
        dailyLimit: null,
        hasReachedLimit: false,
      },
    );

  const refreshDailyAttemptStatus = useCallback(async () => {
    if (!userId || !missionId) {
      return;
    }

    const supabase = createClient();
    const status = await fetchDailyAttemptStatus(supabase, userId, missionId);
    setDailyAttemptStatus(status);
  }, [userId, missionId]);

  useEffect(() => {
    refreshDailyAttemptStatus();
  }, [refreshDailyAttemptStatus]);

  return { ...dailyAttemptStatus, refreshDailyAttemptStatus };
}
