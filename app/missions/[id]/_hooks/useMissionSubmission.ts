"use client";

import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
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

    if (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key) {
      return "達成を報告する";
    }

    return "ミッション完了を記録する";
  }, [
    mission.max_achievement_count,
    mission.required_artifact_type,
    userAchievementCount,
  ]);

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
