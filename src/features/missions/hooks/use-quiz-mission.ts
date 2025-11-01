"use client";

import {
  achieveMissionAction,
  getMissionQuizCategoryAction,
} from "@/features/mission-detail/actions/actions";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import type { Tables } from "@/lib/types/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// クイズ結果の型定義
interface QuizResults {
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
  // クイズカテゴリの状態
  const [quizCategory, setQuizCategory] = useState<string>("その他");

  // クイズ関連の状態
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [quizKey, setQuizKey] = useState(0); // QuizComponentを再マウントするためのkey
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ミッションがQUIZタイプの場合、DBからカテゴリを取得
  useEffect(() => {
    if (mission.required_artifact_type === ARTIFACT_TYPES.QUIZ.key) {
      getMissionQuizCategoryAction(mission.id).then((result) => {
        if (result.success) {
          setQuizCategory(result.category);
        }
      });
    }
  }, [mission.id, mission.required_artifact_type]);

  // クイズ完了時のハンドラ（結果を受け取り、状態を更新）
  const handleQuizComplete = (results: QuizResults) => {
    // エラー状態をクリア（新しいクイズ結果が得られたため）
    onErrorMessage?.(null);

    setQuizResults(results);
    setQuizPassed(results.passed);

    // スクロールはQuizComponent内で結果カードまでスクロールするため、ここでは行わない
  };

  // クイズミッション達成時の処理
  const handleQuizSubmit = async () => {
    // 連続報告を防ぐため、提出中や結果がない場合は早期リターン
    if (isSubmitting || !quizPassed || !quizResults) {
      return;
    }

    try {
      setIsSubmitting(true);
      onErrorMessage?.(null);

      // achieveMissionActionを呼び出してミッション達成を記録
      const formData = new FormData();
      formData.append("missionId", mission.id);
      formData.append("requiredArtifactType", ARTIFACT_TYPES.QUIZ.key);
      formData.append(
        "artifactDescription",
        `クイズ結果: ${quizResults.correctAnswers}/${quizResults.totalQuestions}問正解`,
      );

      const result = await achieveMissionAction(formData);

      if (result.success) {
        // 即座にクイズの状態をリセット（連続報告を防ぐ）
        setQuizResults(null);
        setQuizPassed(false);
        setQuizKey((prev) => prev + 1); // QuizComponentを再マウント

        toast.success("クイズミッション達成！");
        onDialogOpen?.();

        // XPアニメーション表示
        if (result.xpGranted && result.userLevel) {
          const initialXp = result.userLevel.xp - result.xpGranted;
          onXpAnimationData?.({
            initialXp,
            xpGained: result.xpGranted,
          });
        }

        // スクロールはQuizComponent内で処理されるため、ここでは行わない

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
    // 状態
    quizCategory,
    quizPassed,
    quizResults,
    quizKey,
    isSubmitting,

    // ハンドラ
    handleQuizComplete,
    handleQuizSubmit,
  };
}
