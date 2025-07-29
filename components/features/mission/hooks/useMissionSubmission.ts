"use client";

import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { Mission } from "@/lib/types/domain/mission";
import { useMemo } from "react";

export function useMissionSubmission(
  mission: Mission,
  userAchievementCount: number,
) {
  const canSubmitMultipleTimes = useMemo(() => {
    return (
      mission.max_achievement_count === null ||
      mission.max_achievement_count > 1
    );
  }, [mission.max_achievement_count]);

  const requiresArtifact = useMemo(() => {
    return (
      mission.required_artifact_type !== ARTIFACT_TYPES.NONE.key &&
      mission.required_artifact_type !== ARTIFACT_TYPES.LINK_ACCESS.key
    );
  }, [mission.required_artifact_type]);

  const isQuizMission = useMemo(() => {
    return mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key;
  }, [mission.required_artifact_type]);

  const hasReachedUserMaxAchievements = useMemo(() => {
    return (
      mission.max_achievement_count !== null &&
      userAchievementCount >= mission.max_achievement_count
    );
  }, [mission.max_achievement_count, userAchievementCount]);

  const buttonLabel = useMemo(() => {
    if (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key) {
      return "クイズに回答";
    }
    if (mission.required_artifact_type === ARTIFACT_TYPES.LINK_ACCESS.key) {
      return "リンクにアクセス";
    }
    return "ミッション完了を記録する";
  }, [mission.required_artifact_type]);

  const isButtonDisabled = useMemo(() => {
    return hasReachedUserMaxAchievements;
  }, [hasReachedUserMaxAchievements]);

  return {
    canSubmitMultipleTimes,
    requiresArtifact,
    isQuizMission,
    hasReachedUserMaxAchievements,
    buttonLabel,
    isButtonDisabled,
  };
}
