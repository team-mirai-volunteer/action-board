"use client";

import { achieveMissionAction } from "@/lib/api/missions/actions";
import { getQuizCategoriesAction } from "@/lib/api/missions/quiz-actions";
import { ARTIFACT_TYPES } from "@/lib/artifactTypes";
import type { Tables } from "@/lib/types/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface QuizResults {
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
}

interface UseQuizMissionProps {
  mission: Tables<"missions">;
  onSubmissionSuccess?: () => void;
  onXpAnimationData?: (data: { initialXp: number; xpGained: number }) => void;
  onDialogOpen?: () => void;
  onErrorMessage?: (error: string | null) => void;
  scrollToTop?: () => void;
}

export function useQuizMission({
  mission,
  onSubmissionSuccess,
  onXpAnimationData,
  onDialogOpen,
  onErrorMessage,
  scrollToTop,
}: UseQuizMissionProps) {
  const [quizCategory, setQuizCategory] = useState<string>("その他");

  const [quizPassed, setQuizPassed] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key) {
      getQuizCategoriesAction().then(
        (result: {
          success: boolean;
          categories?: Array<{ id: string; name: string }>;
        }) => {
          if (
            result.success &&
            result.categories &&
            result.categories.length > 0
          ) {
            setQuizCategory(result.categories[0].id);
          }
        },
      );
    }
  }, [mission.required_artifact_type]);

  const handleQuizComplete = (
    questionIds: string[],
    answers: string[],
    score: number,
    passed: boolean,
  ) => {
    onErrorMessage?.(null);

    const results: QuizResults = {
      score,
      passed,
      correctAnswers: questionIds.length,
      totalQuestions: questionIds.length,
      results: [],
    };

    setQuizResults(results);
    setQuizPassed(passed);
  };

  const handleQuizSubmit = async () => {
    if (isSubmitting || !quizPassed || !quizResults) {
      return;
    }

    try {
      setIsSubmitting(true);
      onErrorMessage?.(null);

      const formData = new FormData();
      formData.append("missionId", mission.id);
      formData.append("requiredArtifactType", ARTIFACT_TYPES.QUIZ.key);
      formData.append(
        "artifactDescription",
        `クイズ結果: ${quizResults.correctAnswers}/${quizResults.totalQuestions}問正解`,
      );

      const result = await achieveMissionAction(formData);

      if (result.success) {
        setQuizResults(null);
        setQuizPassed(false);
        setQuizKey((prev) => prev + 1);

        toast.success("クイズミッション達成！");
        onDialogOpen?.();

        if (result.xpGranted && result.userLevel) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          onXpAnimationData?.({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        if (onSubmissionSuccess) {
          onSubmissionSuccess();
        }
      } else {
        console.error("achieveMissionAction failed:", result.error);
        onErrorMessage?.(result.error || "ミッションの達成に失敗しました");
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
      onErrorMessage?.("ネットワークエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    quizCategory,
    quizPassed,
    quizResults,
    quizKey,
    isSubmitting,

    handleQuizComplete,
    handleQuizSubmit,
  };
}
