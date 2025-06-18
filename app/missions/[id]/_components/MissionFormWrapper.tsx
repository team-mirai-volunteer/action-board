"use client";

import { ArtifactForm } from "@/components/mission/ArtifactForm";
import QuizComponent from "@/components/mission/QuizComponent";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { XpProgressToastContent } from "@/components/xp-progress-toast-content";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useMissionSubmission } from "../_hooks/useMissionSubmission";
import { useQuizMission } from "../_hooks/useQuizMission";
import { achieveMissionAction } from "../actions";
import { MissionCompleteDialog } from "./MissionCompleteDialog";

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
        difficulty: number;
      }[]
    | null;
};

export function MissionFormWrapper({
  mission,
  authUser,
  userAchievementCount,
  onSubmissionSuccess,
  preloadedQuizQuestions,
}: Props) {
  const { buttonLabel, isButtonDisabled, hasReachedUserMaxAchievements } =
    useMissionSubmission(mission, userAchievementCount);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // XPアニメーション関連の状態
  const [xpAnimationData, setXpAnimationData] = useState<{
    initialXp: number;
    xpGained: number;
  } | null>(null);

  // スクロール位置をトップにリセットする関数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quiz関連の処理をカスタムHookに委託
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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await achieveMissionAction(formData);

      if (result.success) {
        // フォームをクリア
        formRef.current?.reset();
        setFormKey((prev) => prev + 1);

        // XPアニメーション表示
        if (result.xpGranted && result.userLevel) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          setXpAnimationData({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        setIsDialogOpen(true);

        // スクロール位置をリセット
        scrollToTop();
      } else {
        setErrorMessage(result.error || "エラーが発生しました");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMessage("予期しないエラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);

    // エラー状態をクリア
    setErrorMessage(null);

    // XPアニメーション表示
    if (xpAnimationData) {
      toast.custom(
        (t) => (
          <XpProgressToastContent
            initialXp={xpAnimationData.initialXp}
            xpGained={xpAnimationData.xpGained}
            onAnimationComplete={() => {
              toast.dismiss(t);
              setXpAnimationData(null);
            }}
          />
        ),
        {
          duration: Number.POSITIVE_INFINITY,
          position: "bottom-center",
          className: "rounded-md",
        },
      );
    }

    if (onSubmissionSuccess) {
      onSubmissionSuccess();
    }

    // スクロール位置をリセット
    scrollToTop();
  };

  const completed =
    userAchievementCount >= (mission.max_achievement_count || 1);

  return (
    <>
      {!hasReachedUserMaxAchievements &&
        userAchievementCount > 0 &&
        mission?.max_achievement_count !== null && (
          <div className="rounded-lg border bg-muted/50 p-4 text-center mb-4">
            <p className="text-sm font-medium text-muted-foreground">
              {userAchievementCount === mission.max_achievement_count - 1 ? (
                <>
                  復習用チャレンジ（最終回）: {userAchievementCount} /{" "}
                  {mission.max_achievement_count}回
                </>
              ) : (
                <>
                  復習用チャレンジ: {userAchievementCount} /{" "}
                  {mission.max_achievement_count}回
                </>
              )}
            </p>
          </div>
        )}

      {!completed &&
        (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key ? (
          // クイズミッションの場合
          <div className="space-y-4">
            <QuizComponent
              key={quizKey}
              missionId={mission.id}
              isCompleted={completed}
              preloadedQuestions={preloadedQuizQuestions || []}
              onQuizComplete={handleQuizComplete}
              onSubmitAchievement={handleQuizSubmit}
              isSubmittingAchievement={isQuizSubmitting}
              buttonLabel={buttonLabel}
              category={quizCategory}
            />

            {errorMessage && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {errorMessage}
              </div>
            )}
          </div>
        ) : (
          // 通常のアーティファクト提出ミッションの場合
          <form
            ref={formRef}
            action={handleSubmit}
            className="flex flex-col gap-4"
          >
            <input type="hidden" name="missionId" value={mission.id} />
            <input
              type="hidden"
              name="requiredArtifactType"
              value={mission.required_artifact_type ?? ARTIFACT_TYPES.NONE.key}
            />

            <ArtifactForm
              key={formKey}
              mission={mission}
              authUser={authUser}
              disabled={isButtonDisabled || isSubmitting}
              submittedArtifactImagePath={null}
            />
            <SubmitButton
              pendingText="登録中..."
              size="lg"
              disabled={isButtonDisabled || isSubmitting}
            >
              {buttonLabel}
            </SubmitButton>
            <p className="text-sm text-muted-foreground">
              ※
              成果物の内容が認められない場合、ミッションの達成が取り消される場合があります。正確な内容をご記入ください。
            </p>
            {errorMessage && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {errorMessage}
              </div>
            )}
          </form>
        ))}

      {(completed ||
        (userAchievementCount > 0 &&
          mission.max_achievement_count === null)) && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm font-medium text-gray-800">
            このミッションは達成済みです。
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={(e) => {
                e.preventDefault();
                setIsDialogOpen(true);
              }}
              variant="outline"
              className="w-full"
            >
              シェアする
            </Button>
            <Link href="/#featured-missions">
              <Button variant="outline" className="w-full">
                ミッション一覧へ
              </Button>
            </Link>
          </div>
        </div>
      )}

      <MissionCompleteDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        mission={mission}
      />
    </>
  );
}
