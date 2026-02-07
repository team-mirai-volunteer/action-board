"use client";
import { useMemo } from "react";
import { getMissionSubmissionState } from "@/features/missions/utils/mission-submission";
import type { Tables } from "@/lib/types/supabase";

export function useMissionSubmission(
  mission: Tables<"missions">,
  userAchievementCount: number,
) {
  return useMemo(
    () =>
      getMissionSubmissionState(
        mission.max_achievement_count,
        userAchievementCount,
      ),
    [mission.max_achievement_count, userAchievementCount],
  );
}
