"use client";

import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { onboardingDialogues } from "@/lib/onboarding-texts";
import { cn } from "@/lib/utils/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import Image from "next/image";

import { OnboardingCharacter } from "./components/OnboardingCharacter";
import { OnboardingMissionDetails } from "./components/OnboardingMissionDetails";
import { OnboardingWelcome } from "./components/OnboardingWelcome";
import { MOCK_MISSION } from "./constants";
import { useOnboardingState } from "./hooks/useOnboardingState";
import type { OnboardingModalProps } from "./types";

/**
 * オンボーディングモーダルコンポーネント
 *
 * 新規ユーザーに対してアプリケーションの基本的な使い方を説明し、
 * 実際にミッションを体験してもらうためのモーダル
 */
export function OnboardingModal({ open, onOpenChange }: OnboardingModalProps) {
  const {
    currentDialogue,
    isAnimating,
    isSubmissionCompleted,
    contentRef,
    handleNext,
    handleSubmit,
    handleScrollDown,
    handleOpenChange,
  } = useOnboardingState(onOpenChange);

  const currentDialogueData = onboardingDialogues[currentDialogue];
  const mockMission = MOCK_MISSION;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-4 md:inset-6 lg:inset-12 z-60 duration-200",
            "lg:max-w-4xl lg:mx-auto lg:left-0 lg:right-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <VisuallyHidden.Root>
            <DialogPrimitive.Title>オンボーディング</DialogPrimitive.Title>
          </VisuallyHidden.Root>

          <div className="relative w-full h-full bg-gradient-to-b from-[#A8E6CF] to-[#7FCDCD] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* 閉じるボタン */}
            <CloseButton onClose={() => handleOpenChange(false)} />

            {/* コンテンツエリア */}
            <div
              ref={contentRef}
              className="relative flex-1 overflow-hidden"
              style={{
                ...(currentDialogueData?.showMissionDetails
                  ? { overflowY: "auto" }
                  : {}),
              }}
            >
              {/* 背景画像 */}
              <BackgroundImage isWelcome={currentDialogueData.isWelcome} />

              {/* ウェルカム画面 */}
              <div className="relative z-10">
                {currentDialogueData.isWelcome && <OnboardingWelcome />}
              </div>

              {/* キャラクターとコメント */}
              <div className="relative z-10">
                <OnboardingCharacter
                  currentDialogue={currentDialogue}
                  isAnimating={isAnimating}
                  onNext={handleNext}
                  onScrollDown={handleScrollDown}
                />
              </div>

              {/* ミッション詳細表示 */}
              <div className="relative z-10">
                {currentDialogueData?.showMissionDetails && (
                  <OnboardingMissionDetails
                    mission={mockMission}
                    isSubmissionCompleted={isSubmissionCompleted}
                    onSubmit={handleSubmit}
                  />
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

/**
 * 閉じるボタンコンポーネント
 */
const CloseButton: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <button
    type="button"
    onClick={onClose}
    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
    style={{ mixBlendMode: "difference" }}
  >
    <X className="h-8 w-8" />
  </button>
);

/**
 * 背景画像コンポーネント
 */
const BackgroundImage: React.FC<{ isWelcome: boolean }> = ({ isWelcome }) => (
  <div className="absolute inset-0 w-full h-full z-0">
    <Image
      src={
        isWelcome
          ? "/img/onboarding/background-only.svg"
          : "/img/onboarding/background.svg"
      }
      alt="オンボーディング背景"
      fill
      className="object-fill"
      priority
    />
  </div>
);
