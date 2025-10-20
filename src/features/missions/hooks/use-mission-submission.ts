"use client";
import type { Tables } from "@/lib/types/supabase";
import { useMemo } from "react";

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
