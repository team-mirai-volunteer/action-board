import { onboardingDialogues } from "@/lib/onboarding-texts";
import { useEffect, useRef, useState } from "react";
import { ANIMATION_DURATION } from "../constants";
import type { UseOnboardingActions, UseOnboardingState } from "../types";
import {
  calculateDefaultScrollPosition,
  calculateScrollPosition,
} from "../utils";

/**
 * オンボーディング状態管理フック（期日前投票専用）
 */
export const useOnboardingState = (
  onOpenChange: (open: boolean) => void,
): UseOnboardingState &
  UseOnboardingActions & {
    contentRef: React.RefObject<HTMLDivElement | null>;
  } => {
  const [currentDialogue, setCurrentDialogue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmissionCompleted, setIsSubmissionCompleted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 画面遷移時にスクロール位置をトップにリセット
  useEffect(() => {
    // ミッション詳細画面以外、またはアニメーション完了後にスクロールリセット
    if (
      contentRef.current &&
      !onboardingDialogues[currentDialogue]?.showMissionDetails
    ) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentDialogue]);

  const handleNext = () => {
    if (currentDialogue < onboardingDialogues.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDialogue(currentDialogue + 1);
        setIsAnimating(false);
      }, ANIMATION_DURATION.PAGE_TRANSITION);
    } else if (currentDialogue === onboardingDialogues.length - 1) {
      onOpenChange(false);
      setCurrentDialogue(0);
      setIsSubmissionCompleted(false);
    }
  };

  const handleScrollDown = () => {
    if (!contentRef.current) return;

    // ミッション詳細画面の場合はカードのボトムが見える位置までスクロール
    if (onboardingDialogues[currentDialogue]?.showMissionDetails) {
      const missionDetailCard = contentRef.current.querySelector(
        "[data-mission-detail-card]",
      );
      if (missionDetailCard) {
        const scrollAmount = calculateScrollPosition(
          contentRef.current,
          missionDetailCard as HTMLElement,
        );

        if (scrollAmount > 0) {
          contentRef.current.scrollTo({
            top: contentRef.current.scrollTop + scrollAmount,
            behavior: "smooth",
          });
        }
      }
    } else {
      // それ以外の場合は300px下にスクロール
      const scrollTarget = calculateDefaultScrollPosition(contentRef.current);
      contentRef.current.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    }
  };

  const handleSubmit = () => {
    setIsSubmissionCompleted(true);
    // 提出完了後、少し待ってから次へ進む
    setTimeout(() => {
      handleNext();
    }, ANIMATION_DURATION.SUBMISSION_COMPLETE);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setCurrentDialogue(0);
      setIsAnimating(false);
      setIsSubmissionCompleted(false);
    }
  };

  return {
    // State
    currentDialogue,
    isAnimating,
    isSubmissionCompleted,
    contentRef,
    // Actions
    handleNext,
    handleSubmit,
    handleScrollDown,
    handleOpenChange,
  };
};
