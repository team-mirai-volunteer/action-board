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

  // クイズ関連の状態
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    results: Array<{
      questionId: string;
      correct: boolean;
      explanation: string;
      selectedAnswer?: number;
      correctAnswer?: number;
    }>;
  } | null>(null);
  const [quizKey, setQuizKey] = useState(0); // QuizComponentを再マウントするためのkey

  // XPアニメーション関連の状態
  const [xpAnimationData, setXpAnimationData] = useState<{
    initialXp: number;
    xpGained: number;
  } | null>(null);

  // スクロール位置をトップにリセットする関数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // クイズ完了時のハンドラ（結果を受け取り、状態を更新）
  const handleQuizComplete = (results: {
    score: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
    results: Array<{
      questionId: string;
      correct: boolean;
      explanation: string;
      selectedAnswer?: number;
      correctAnswer?: number;
    }>;
  }) => {
    console.log("Quiz completed with results:", results);

    // エラー状態をクリア（新しいクイズ結果が得られたため）
    setErrorMessage(null);

    setQuizResults(results);
    setQuizPassed(results.passed);
    console.log("State updated - quizPassed:", results.passed);

    // スクロール位置をリセット
    scrollToTop();
  };

  // クイズミッション達成時の処理
  const handleQuizSubmit = async () => {
    console.log("handleQuizSubmit called", { quizPassed, quizResults });

    // 連続報告を防ぐため、提出中や結果がない場合は早期リターン
    if (isSubmitting || !quizPassed || !quizResults) {
      console.log(
        "Early return: already submitting, quiz not passed, or no results",
      );
      return;
    }

    try {
      console.log("Starting quiz submission...");
      setIsSubmitting(true);
      setErrorMessage(null);

      // achieveMissionActionを呼び出してミッション達成を記録
      const formData = new FormData();
      formData.append("missionId", mission.id);
      formData.append("requiredArtifactType", ARTIFACT_TYPES.QUIZ.key);
      formData.append(
        "artifactDescription",
        `クイズ結果: ${quizResults.correctAnswers}/${quizResults.totalQuestions}問正解`,
      );

      console.log("Calling achieveMissionAction with formData:", {
        missionId: mission.id,
        requiredArtifactType: ARTIFACT_TYPES.QUIZ.key,
        artifactDescription: `クイズ結果: ${quizResults.correctAnswers}/${quizResults.totalQuestions}問正解`,
      });

      const result = await achieveMissionAction(formData);
      console.log("achieveMissionAction result:", result);

      if (result.success) {
        console.log("Success! Showing toast and dialog");

        // 即座にクイズの状態をリセット（連続報告を防ぐ）
        setQuizResults(null);
        setQuizPassed(false);
        setQuizKey((prev) => prev + 1); // QuizComponentを再マウント

        toast.success("クイズミッション達成！");
        setIsDialogOpen(true);

        // XPアニメーション表示
        if (result.xpGranted && result.userLevel) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          setXpAnimationData({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        // スクロール位置をリセット
        scrollToTop();

        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        console.error("achieveMissionAction failed:", result.error);
        setErrorMessage(result.error || "ミッションの達成に失敗しました");
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
      setErrorMessage("ネットワークエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

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
              isSubmittingAchievement={isSubmitting}
              buttonLabel={buttonLabel}
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
