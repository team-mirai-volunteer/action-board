"use client";

import { MissionCompleteDialog } from "@/components/features/mission/dialogs/MissionCompleteDialog";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { XpProgressToastContent } from "@/components/xp-progress-toast-content";
import { achieveMissionAction } from "@/lib/api/missions/actions";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { MainLinkButton } from "../components/MainLinkButton";
import { useMissionSubmission } from "../hooks/useMissionSubmission";
import { useQuizMission } from "../hooks/useQuizMission";
import { ArtifactForm } from "./ArtifactForm";
import QuizComponent from "./QuizComponent";

type Props = {
  mission: Tables<"missions">;
  authUser: User;
  userAchievementCount: number;
  onSubmissionSuccess?: () => void;
  preloadedQuizQuestions?:
    | {
        id: string;
        question: string;
        options: string[];
        category?: string;
      }[]
    | null;
  mainLink?: Tables<"mission_main_links"> | null;
};

export function MissionFormWrapper({
  mission,
  authUser,
  userAchievementCount,
  onSubmissionSuccess,
  preloadedQuizQuestions,
  mainLink,
}: Props) {
  const { buttonLabel, isButtonDisabled, hasReachedUserMaxAchievements } =
    useMissionSubmission(mission, userAchievementCount);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const [xpAnimationData, setXpAnimationData] = useState<{
    initialXp: number;
    xpGained: number;
  } | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const {
    quizCategory,
    quizKey,
    isSubmitting: isQuizSubmitting,
    handleQuizComplete,
    handleQuizSubmit,
  } = useQuizMission({
    mission,
    onSubmissionSuccess,
    onXpAnimationData: setXpAnimationData,
    onDialogOpen: () => setIsDialogOpen(true),
    onErrorMessage: setErrorMessage,
    scrollToTop,
  });

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result = await achieveMissionAction(formData);

      if (result.success) {
        setFormKey((prev) => prev + 1);
        setIsDialogOpen(true);

        if (result.xpGranted && result.userLevel) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          setXpAnimationData({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        scrollToTop();

        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        console.error("achieveMissionAction failed:", result.error);
        setErrorMessage(result.error || "ミッションの達成に失敗しました");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("ネットワークエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkAccessClick = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (isSubmitting) return { success: false, error: "処理中です" };

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("missionId", mission.id);
      formData.append("requiredArtifactType", ARTIFACT_TYPES.LINK_ACCESS.key);
      formData.append("artifactDescription", "リンクアクセス完了");

      const result = await achieveMissionAction(formData);

      if (result.success) {
        setIsDialogOpen(true);

        if (result.xpGranted && result.userLevel) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          setXpAnimationData({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        scrollToTop();

        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }

        return { success: true };
      }
      console.error("achieveMissionAction failed:", result.error);
      setErrorMessage(result.error || "ミッションの達成に失敗しました");
      return { success: false, error: result.error };
    } catch (error) {
      console.error("Link access error:", error);
      setErrorMessage("ネットワークエラーが発生しました");
      return { success: false, error: "ネットワークエラーが発生しました" };
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = hasReachedUserMaxAchievements;

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 text-sm">{errorMessage}</div>
        </div>
      )}

      {mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key ? (
        <div className="space-y-4">
          <QuizComponent
            key={quizKey}
            category={quizCategory}
            preloadedQuestions={preloadedQuizQuestions || undefined}
            onQuizComplete={handleQuizComplete}
            missionId={mission.id}
            isCompleted={isCompleted}
            onSubmitAchievement={handleQuizSubmit}
            isSubmittingAchievement={isQuizSubmitting}
            buttonLabel="クイズ結果を送信"
            onAchievementSuccess={() => {}}
          />
        </div>
      ) : mission.required_artifact_type === ARTIFACT_TYPES.LINK_ACCESS.key &&
        mainLink ? (
        <div className="space-y-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-700 font-medium mb-2">
              リンクアクセスミッション
            </div>
            <div className="text-sm text-blue-600 mb-4">
              下のボタンをクリックしてリンクにアクセスしてください
            </div>
          </div>
          <MainLinkButton
            mission={mission}
            mainLink={mainLink}
            onLinkClick={isCompleted ? undefined : handleLinkAccessClick}
            isDisabled={false}
          />
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            formData.append("missionId", mission.id);
            formData.append(
              "requiredArtifactType",
              mission.required_artifact_type,
            );
            handleSubmit(formData);
          }}
        >
          <ArtifactForm
            key={formKey}
            mission={mission}
            authUser={authUser}
            disabled={isSubmitting}
            submittedArtifactImagePath={null}
          />
          <div className="mt-4">
            <SubmitButton
              disabled={isButtonDisabled || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "送信中..." : buttonLabel}
            </SubmitButton>
            {isCompleted && (
              <div className="text-center mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 font-medium text-sm">
                  このミッションは完了済みです
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      <MissionCompleteDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mission={mission}
      />

      {xpAnimationData && (
        <div className="fixed top-4 right-4 z-50">
          {toast.custom(
            (t) => (
              <XpProgressToastContent
                initialXp={xpAnimationData.initialXp}
                xpGained={xpAnimationData.xpGained}
                onAnimationComplete={() => {
                  setXpAnimationData(null);
                  toast.dismiss(t);
                }}
              />
            ),
            {
              duration: Number.POSITIVE_INFINITY,
              position: "top-right",
            },
          )}
        </div>
      )}
    </div>
  );
}
