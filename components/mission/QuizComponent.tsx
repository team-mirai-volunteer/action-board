"use client";

import { checkQuizAnswersAction } from "@/app/missions/[id]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: number;
}

interface ShuffledQuizQuestion extends QuizQuestion {
  shuffledOptions: string[];
  originalToShuffledMapping: number[]; // 元のインデックスからシャッフル後のインデックスへのマッピング
  shuffledToOriginalMapping: number[]; // シャッフル後のインデックスから元のインデックスへのマッピング
}

interface QuizResult {
  success: boolean;
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
  error?: string;
}

interface QuizComponentProps {
  missionId: string;
  isCompleted?: boolean;
  preloadedQuestions?: QuizQuestion[];
  onQuizComplete?: (results: QuizResult) => void;
  onSubmitAchievement?: () => void;
  isSubmittingAchievement?: boolean;
  buttonLabel?: string;
  onAchievementSuccess?: () => void;
  category?: string; // カテゴリー名を追加
}

export default function QuizComponent({
  missionId,
  isCompleted = false,
  preloadedQuestions,
  onQuizComplete,
  onSubmitAchievement,
  isSubmittingAchievement = false,
  buttonLabel = "達成を報告する",
  onAchievementSuccess,
  category,
}: QuizComponentProps) {
  // カテゴリーによる達成メッセージを生成する関数
  const getAchievementMessage = (categoryName?: string) => {
    switch (categoryName) {
      case "政策・マニフェスト":
        return "ミッション達成！政策・マニフェストマスターですね！";
      case "チームみらい":
        return "ミッション達成！チームみらいマスターですね！";
      case "公職選挙法":
        return "ミッション達成！公職選挙法マスターですね！";
      default:
        return "ミッション達成！クイズマスターですね！";
    }
  };

  // クライアントサイドかどうかを判定
  const [isClient, setIsClient] = useState(false);

  // 配列をシャッフルする関数
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // 選択肢をシャッフルした問題を作成する関数（クライアントサイドでのみシャッフル）
  const createShuffledQuestion = useCallback(
    (question: QuizQuestion, shouldShuffle = true): ShuffledQuizQuestion => {
      const optionsWithIndex = question.options.map((option, index) => ({
        option,
        originalIndex: index,
      }));

      // クライアントサイドでのみシャッフル、サーバーサイドでは元の順序を保持
      const shuffledOptionsWithIndex =
        shouldShuffle && isClient
          ? shuffleArray(optionsWithIndex)
          : optionsWithIndex;

      const shuffledOptions = shuffledOptionsWithIndex.map(
        (item) => item.option,
      );
      const originalToShuffledMapping: number[] = [];
      const shuffledToOriginalMapping: number[] = [];

      // マッピングを作成
      shuffledOptionsWithIndex.forEach((item, shuffledIndex) => {
        originalToShuffledMapping[item.originalIndex] = shuffledIndex;
        shuffledToOriginalMapping[shuffledIndex] = item.originalIndex;
      });

      return {
        ...question,
        shuffledOptions,
        originalToShuffledMapping,
        shuffledToOriginalMapping,
      };
    },
    [shuffleArray, isClient],
  );

  // 初期状態では常にローディング状態にして、クライアントサイドでシャッフル完了後に表示
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<ShuffledQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // クライアントサイドでのマウント時の処理
  useEffect(() => {
    setIsClient(true);
  }, []);

  // クライアントサイドでマウントされた後にシャッフルを実行
  useEffect(() => {
    if (isClient && preloadedQuestions) {
      if (preloadedQuestions.length === 0) {
        setIsLoading(false);
        return;
      }
      const shuffledQuestions = preloadedQuestions.map((q) =>
        createShuffledQuestion(q, true),
      );
      setQuestions(shuffledQuestions);
      setIsLoading(false);
    } else if (isClient && !preloadedQuestions) {
      setIsLoading(true);
    }
  }, [preloadedQuestions, createShuffledQuestion, isClient]);

  // 回答を設定
  const handleAnswerChange = (
    questionId: string,
    shuffledAnswerIndex: number,
  ) => {
    // シャッフル後のインデックスを元のインデックスに変換
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const originalAnswerIndex =
        question.shuffledToOriginalMapping[shuffledAnswerIndex];
      setAnswers((prev) => ({
        ...prev,
        [questionId]: originalAnswerIndex + 1, // 1ベースのインデックス
      }));
    }
  };

  // 全問回答されているかチェック
  const allQuestionsAnswered =
    questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  // クイズを提出
  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return;

    try {
      setIsSubmitting(true);
      const answerArray = questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answers[q.id],
      }));

      const response = await checkQuizAnswersAction(missionId, answerArray);
      if (response.success) {
        const quizResult = response as QuizResult;
        setResult(quizResult);
        // クイズ完了時にコールバックを呼び出し
        if (onQuizComplete) {
          onQuizComplete(quizResult);
        }
      } else {
        setError(response.error || "クイズの採点に失敗しました");
      }
    } catch (err) {
      setError("クイズの提出中にエラーが発生しました");
      console.error("Error submitting quiz:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 再挑戦
  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setError(null);

    // 選択肢を再シャッフル
    if (preloadedQuestions) {
      const shuffledQuestions = preloadedQuestions.map((q) =>
        createShuffledQuestion(q, true),
      );
      setQuestions(shuffledQuestions);
    }

    // スクロール位置をリセット
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ローディング状態の表示
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600">クイズを読み込み中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || questions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
          <span className="text-red-600">
            {error || "クイズ問題が見つかりません"}
          </span>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <>
        {/* 各問題の詳細結果をカードで表示（回答時と同じレイアウト） */}
        {result.results.map((res, index) => {
          const question = questions.find((q) => q.id === res.questionId);
          if (!question) return null;

          return (
            <Card key={res.questionId} className="w-full">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">
                  Q{index + 1}. {question.question}
                </h3>

                {/* 正解・不正解の表示 */}
                <div className="mb-2">
                  {res.correct ? (
                    <span className="text-green-700 font-semibold">正解</span>
                  ) : (
                    <span className="text-red-600 font-semibold">不正解</span>
                  )}
                </div>

                <div className="space-y-3">
                  {question.shuffledOptions.map((option, shuffledIndex) => {
                    // 元のインデックスを取得
                    const originalIndex =
                      question.shuffledToOriginalMapping[shuffledIndex];
                    const isSelected = res.selectedAnswer === originalIndex + 1;
                    const isCorrect = res.correctAnswer === originalIndex + 1;

                    // アイコンとテキストの色を設定
                    let iconElement: React.ReactNode;
                    let labelClass = "text-sm cursor-default";

                    if (isCorrect) {
                      // 正解の場合（緑色のチェックマーク）
                      iconElement = (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      );
                      labelClass += " font-medium text-green-800";
                    } else if (isSelected && !isCorrect) {
                      // ユーザーが選択した不正解の場合（赤色のバツマーク）
                      iconElement = (
                        <XCircle className="h-4 w-4 text-red-600" />
                      );
                      labelClass += " font-medium text-red-600";
                    } else {
                      // 未選択の場合（グレーの丸）
                      iconElement = (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      );
                      labelClass += " text-gray-700";
                    }

                    return (
                      <div
                        key={`${question.id}-${shuffledIndex}`}
                        className="flex items-center space-x-3"
                      >
                        {iconElement}
                        <Label
                          htmlFor={`result-${question.id}-${shuffledIndex}`}
                          className={labelClass}
                        >
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>

                {res.explanation && (
                  <div className="mt-6 bg-teal-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-teal-800 mb-1">
                      解説
                    </div>
                    <div className="text-sm text-teal-700">
                      {res.explanation}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* 結果カード */}
        <Card className="w-full">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <div className="text-xl font-bold flex mb-6">
                <div>結果: {result.totalQuestions}問中</div>
                <div className="ml-2 text-primary">
                  {result.correctAnswers}問正解
                </div>
              </div>
              {result.passed ? (
                <div>{getAchievementMessage(category)}</div>
              ) : (
                <div className="text-red-600">
                  全問正解が必要です。再挑戦してください
                </div>
              )}
            </div>

            {result.passed ? (
              <Button
                onClick={onSubmitAchievement}
                disabled={isSubmittingAchievement}
                className="w-full"
                size="lg"
              >
                {isSubmittingAchievement ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    登録中...
                  </>
                ) : (
                  buttonLabel
                )}
              </Button>
            ) : (
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="outline"
              >
                再挑戦する
              </Button>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      {questions.map((question, index) => (
        <Card key={question.id} className="w-full">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-6">
              Q{index + 1}. {question.question}
            </h3>

            <div className="space-y-3">
              {question.shuffledOptions.map((option, shuffledIndex) => {
                // 現在の回答をシャッフル後のインデックスに変換して表示
                const originalAnswerIndex = answers[question.id]
                  ? answers[question.id] - 1
                  : -1;
                const shuffledAnswerIndex =
                  originalAnswerIndex >= 0
                    ? question.originalToShuffledMapping[originalAnswerIndex]
                    : -1;

                return (
                  <div
                    key={`${question.id}-${shuffledIndex}`}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="radio"
                      id={`${question.id}-${shuffledIndex}`}
                      name={question.id}
                      value={shuffledIndex}
                      checked={shuffledAnswerIndex === shuffledIndex}
                      onChange={() =>
                        handleAnswerChange(question.id, shuffledIndex)
                      }
                      className="h-4 w-4 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor={`${question.id}-${shuffledIndex}`}
                      className="text-sm cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="w-full">
        <CardContent className="p-6">
          <Button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                提出中...
              </>
            ) : (
              "回答する"
            )}
          </Button>

          {!allQuestionsAnswered && questions.length > 0 && (
            <p className="text-sm text-gray-500 text-center mt-3">
              すべての問題に回答してから提出してください
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
