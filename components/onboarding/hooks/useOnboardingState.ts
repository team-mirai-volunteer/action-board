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
    console.log("🔽 handleScrollDown called");
    console.log("📍 currentDialogue:", currentDialogue);
    console.log("📍 contentRef.current exists:", !!contentRef.current);

    if (!contentRef.current) return;

    // ミッション詳細画面の場合はカードのボトムが見える位置までスクロール
    if (onboardingDialogues[currentDialogue]?.showMissionDetails) {
      console.log("📍 Mission details screen detected");
      const missionDetailCard = contentRef.current.querySelector(
        "[data-mission-detail-card]",
      );
      console.log("📍 Mission detail card found:", !!missionDetailCard);

      if (missionDetailCard) {
        // ミッション詳細まで直接スクロール（60vh分）
        console.log("📍 Scrolling to mission details");
        contentRef.current.scrollTo({
          top: window.innerHeight * 0.6, // 0.6画面分下にスクロール
          behavior: "smooth",
        });
      }
    } else {
      console.log("📍 Default scroll case");
      // それ以外の場合は300px下にスクロール
      const scrollTarget = calculateDefaultScrollPosition(contentRef.current);
      console.log("📍 Default scroll target:", scrollTarget);
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
