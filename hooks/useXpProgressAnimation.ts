"use client";

import { markLevelUpSeenAction } from "@/app/actions/level-up";
import type { UserLevel } from "@/lib/services/userLevel";
import { calculateLevel, totalXp } from "@/lib/utils/utils";
import { useCallback, useState } from "react";

interface UseXpProgressAnimationProps {
  onLevelUp?: (newLevel: number, pointsToNextLevel: number) => void;
}

interface AnimationStage {
  level: number;
  startXp: number;
  endXp: number;
  levelStartXp: number;
  nextLevelRequiredXp: number;
  xpRangeForLevel: number;
}

export function useXpProgressAnimation({
  onLevelUp,
}: UseXpProgressAnimationProps = {}) {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastData, setToastData] = useState<{
    userLevel: UserLevel;
    xpGranted: number;
    startLevel: number;
    startLevelStartXp: number;
    nextLevelRequiredXp: number;
    xpRangeForCurrentLevel: number;
    isMultiLevel?: boolean;
    stages?: AnimationStage[];
    finalLevel?: number;
  } | null>(null);
  const [isLevelUpDialogOpen, setIsLevelUpDialogOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    newLevel: number;
    pointsToNextLevel: number;
  } | null>(null);

  const startXpAnimation = useCallback(
    (userLevel: UserLevel, xpGranted: number) => {
      const startXp = userLevel.xp - xpGranted;
      const endXp = userLevel.xp;
      const startLevel = calculateLevel(startXp);
      const finalLevel = calculateLevel(endXp);

      if (finalLevel > startLevel + 1) {
        const stages: AnimationStage[] = [];
        for (let level = startLevel; level < finalLevel; level++) {
          const stageStartXp = Math.max(startXp, totalXp(level));
          const stageEndXp = Math.min(endXp, totalXp(level + 1));
          stages.push({
            level,
            startXp: stageStartXp,
            endXp: stageEndXp,
            levelStartXp: totalXp(level),
            nextLevelRequiredXp: totalXp(level + 1),
            xpRangeForLevel: totalXp(level + 1) - totalXp(level),
          });
        }

        setToastData({
          userLevel,
          xpGranted,
          startLevel,
          startLevelStartXp: totalXp(startLevel),
          nextLevelRequiredXp: totalXp(startLevel + 1),
          xpRangeForCurrentLevel: totalXp(startLevel + 1) - totalXp(startLevel),
          isMultiLevel: true,
          stages,
          finalLevel,
        });
      } else {
        const startLevelStartXp = totalXp(startLevel);
        const nextLevelRequiredXp = totalXp(startLevel + 1);
        const xpRangeForCurrentLevel = nextLevelRequiredXp - startLevelStartXp;

        setToastData({
          userLevel,
          xpGranted,
          startLevel,
          startLevelStartXp,
          nextLevelRequiredXp,
          xpRangeForCurrentLevel,
          isMultiLevel: false,
        });
      }
      setIsToastOpen(true);
    },
    [],
  );

  const handleLevelUp = useCallback(
    async (newLevel: number, pointsToNextLevel: number) => {
      setLevelUpData({ newLevel, pointsToNextLevel });
      setIsLevelUpDialogOpen(true);
      onLevelUp?.(newLevel, pointsToNextLevel);

      try {
        const result = await markLevelUpSeenAction();
        if (!result.success) {
          console.error(
            "Failed to mark level up notification as seen:",
            result.error,
          );
        }
      } catch (error) {
        console.error("Error marking level up notification as seen:", error);
      }
    },
    [onLevelUp],
  );

  const checkLevelUp = useCallback(
    (
      currentXp: number,
      endXp: number,
      nextLevelRequiredXp: number,
      isMultiLevel?: boolean,
      finalLevel?: number,
    ) => {
      if (isMultiLevel && finalLevel) {
        if (currentXp >= totalXp(finalLevel)) {
          const finalLevelStartXp = totalXp(finalLevel);
          const finalNextLevelRequiredXp = totalXp(finalLevel + 1);
          const pointsToNextLevel = finalNextLevelRequiredXp - endXp;

          setLevelUpData({ newLevel: finalLevel, pointsToNextLevel });
          setIsLevelUpDialogOpen(true);
          onLevelUp?.(finalLevel, pointsToNextLevel);
          return true;
        }
      } else {
        if (currentXp >= nextLevelRequiredXp) {
          const finalLevel = calculateLevel(endXp);
          const finalLevelStartXp = totalXp(finalLevel);
          const finalNextLevelRequiredXp = totalXp(finalLevel + 1);
          const pointsToNextLevel = finalNextLevelRequiredXp - endXp;

          setLevelUpData({ newLevel: finalLevel, pointsToNextLevel });
          setIsLevelUpDialogOpen(true);
          onLevelUp?.(finalLevel, pointsToNextLevel);
          return true;
        }
      }
      return false;
    },
    [onLevelUp],
  );

  const handleLevelUpDialogClose = useCallback(() => {
    setIsLevelUpDialogOpen(false);
    setLevelUpData(null);
  }, []);

  const handleToastClose = useCallback(() => {
    setIsToastOpen(false);
    setToastData(null);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setIsToastOpen(false);
      setToastData(null);
    }, 1000);
  }, []);

  return {
    isToastOpen,
    toastData,
    isLevelUpDialogOpen,
    levelUpData,
    startXpAnimation,
    handleLevelUp,
    checkLevelUp,
    handleLevelUpDialogClose,
    handleToastClose,
    handleAnimationComplete,
  };
}
