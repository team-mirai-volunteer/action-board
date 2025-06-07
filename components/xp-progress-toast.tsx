"use client";

import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { calculateLevel, totalXp } from "@/lib/utils/utils";
import React, { useEffect, useState } from "react";

import type { UserLevel } from "@/lib/services/userLevel";

interface AnimationStage {
  level: number;
  startXp: number;
  endXp: number;
  levelStartXp: number;
  nextLevelRequiredXp: number;
  xpRangeForLevel: number;
}

interface XpProgressToastProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userLevel: UserLevel;
  xpGranted: number;
  startLevel: number;
  startLevelStartXp: number;
  nextLevelRequiredXp: number;
  xpRangeForCurrentLevel: number;
  isMultiLevel?: boolean;
  stages?: AnimationStage[];
  finalLevel?: number;
  onLevelUp?: (
    currentXp: number,
    endXp: number,
    nextLevelRequiredXp: number,
    isMultiLevel?: boolean,
    finalLevel?: number,
  ) => boolean;
  onAnimationComplete?: () => void;
}

export function XpProgressToast({
  isOpen,
  onOpenChange,
  userLevel,
  xpGranted,
  startLevel,
  startLevelStartXp,
  nextLevelRequiredXp,
  xpRangeForCurrentLevel,
  isMultiLevel,
  stages,
  finalLevel,
  onLevelUp,
  onAnimationComplete,
}: XpProgressToastProps) {
  const [animatedXp, setAnimatedXp] = useState(userLevel.xp - xpGranted);
  const [hasTriggeredLevelUp, setHasTriggeredLevelUp] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const startXp = userLevel.xp - xpGranted;
    const endXp = userLevel.xp;

    if (isMultiLevel && stages && stages.length > 0) {
      const animateStage = (stageIndex: number) => {
        if (stageIndex >= stages.length) {
          onAnimationComplete?.();
          return;
        }

        const stage = stages[stageIndex];
        const stageDuration = 1500;
        const stageStartTime = Date.now();

        const animateStageProgress = () => {
          const elapsed = Date.now() - stageStartTime;
          const progress = Math.min(elapsed / stageDuration, 1);
          const easeOutQuart = 1 - (1 - progress) ** 4;

          const currentXp =
            stage.startXp + (stage.endXp - stage.startXp) * easeOutQuart;
          setAnimatedXp(currentXp);
          setCurrentStage(stageIndex);

          if (
            stageIndex === stages.length - 1 &&
            !hasTriggeredLevelUp &&
            onLevelUp
          ) {
            if (
              onLevelUp(
                currentXp,
                endXp,
                stage.nextLevelRequiredXp,
                isMultiLevel,
                finalLevel,
              )
            ) {
              setHasTriggeredLevelUp(true);
            }
          }

          if (progress < 1) {
            requestAnimationFrame(animateStageProgress);
          } else {
            setTimeout(() => animateStage(stageIndex + 1), 300);
          }
        };

        animateStageProgress();
      };

      const timer = setTimeout(() => animateStage(0), 500);
      return () => clearTimeout(timer);
    }

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - (1 - progress) ** 4;
      const currentXp = startXp + (endXp - startXp) * easeOutQuart;

      setAnimatedXp(currentXp);

      if (
        !hasTriggeredLevelUp &&
        onLevelUp &&
        onLevelUp(currentXp, endXp, nextLevelRequiredXp)
      ) {
        setHasTriggeredLevelUp(true);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onAnimationComplete?.();
      }
    };

    const timer = setTimeout(animate, 500);
    return () => clearTimeout(timer);
  }, [
    isOpen,
    userLevel.xp,
    xpGranted,
    isMultiLevel,
    stages,
    finalLevel,
    nextLevelRequiredXp,
    hasTriggeredLevelUp,
    onLevelUp,
    onAnimationComplete,
  ]);

  const getCurrentStageData = () => {
    if (isMultiLevel && stages && stages[currentStage]) {
      const stage = stages[currentStage];
      return {
        level: stage.level,
        levelStartXp: stage.levelStartXp,
        xpRangeForLevel: stage.xpRangeForLevel,
        nextLevel: stage.level + 1,
      };
    }
    return {
      level: startLevel,
      levelStartXp: startLevelStartXp,
      xpRangeForLevel: xpRangeForCurrentLevel,
      nextLevel: startLevel + 1,
    };
  };

  const stageData = getCurrentStageData();
  const progressInCurrentLevel = Math.max(
    0,
    animatedXp - stageData.levelStartXp,
  );
  const progressPercentage = Math.min(
    (progressInCurrentLevel / stageData.xpRangeForLevel) * 100,
    100,
  );

  return (
    <ToastProvider>
      <Toast open={isOpen} onOpenChange={onOpenChange} className="w-full max-w-sm mx-auto">
        <div className="flex flex-col space-y-3 p-2">
          <ToastTitle className="text-base font-bold text-center">
            +{xpGranted}XP獲得！
          </ToastTitle>
          <ToastDescription className="text-sm text-gray-600 text-center">
            次のレベルまで{" "}
            {Math.max(
              0,
              Math.ceil(
                stageData.levelStartXp + stageData.xpRangeForLevel - animatedXp,
              ),
            )}
            XP
          </ToastDescription>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Lv.{stageData.level}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full rounded-full transition-all duration-100 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium">
              Lv.{stageData.nextLevel}
            </span>
          </div>
        </div>
      </Toast>
      <ToastViewport className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col p-4 gap-2 w-full max-w-sm mx-auto" />
    </ToastProvider>
  );
}
