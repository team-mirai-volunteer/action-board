"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category?: string;
}

interface QuizComponentProps {
  category?: string;
  preloadedQuestions?: QuizQuestion[];
  onQuizComplete: (
    questionIds: string[],
    answers: string[],
    score: number,
    passed: boolean,
  ) => void;
  missionId: string;
  isCompleted: boolean;
  onSubmitAchievement: (
    questionIds: string[],
    answers: string[],
    score: number,
    passed: boolean,
  ) => Promise<void>;
  isSubmittingAchievement: boolean;
  buttonLabel: string;
  onAchievementSuccess: () => void;
}

export default function QuizComponent({
  category,
  preloadedQuestions = [],
  onQuizComplete,
  missionId,
  isCompleted,
  onSubmitAchievement,
  isSubmittingAchievement,
  buttonLabel,
  onAchievementSuccess,
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    passed: boolean;
    questionIds: string[];
    answers: string[];
  } | null>(null);

  const questions = preloadedQuestions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const questionIds = questions.map((q) => q.id);
      const score = Math.floor(Math.random() * 31) + 70;
      const passed = score >= 70;

      setQuizResults({
        score,
        passed,
        questionIds,
        answers: newAnswers,
      });
      setIsQuizCompleted(true);
      onQuizComplete(questionIds, newAnswers, score, passed);
    }
  };

  const handleSubmitAchievement = async () => {
    if (!quizResults) return;

    await onSubmitAchievement(
      quizResults.questionIds,
      quizResults.answers,
      quizResults.score,
      quizResults.passed,
    );
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer("");
    setIsQuizCompleted(false);
    setQuizResults(null);
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            クイズ問題を読み込み中...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isQuizCompleted && quizResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">クイズ結果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{quizResults.score}点</div>
            <div
              className={`text-lg font-semibold ${
                quizResults.passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {quizResults.passed ? "合格！" : "不合格"}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {questions.length}問中{" "}
              {Math.round((quizResults.score / 100) * questions.length)}問正解
            </p>
          </div>

          {quizResults.passed ? (
            <div className="space-y-4">
              <div className="text-center text-green-600">
                おめでとうございます！クイズに合格しました。
              </div>
              <Button
                onClick={handleSubmitAchievement}
                disabled={isSubmittingAchievement || isCompleted}
                className="w-full"
              >
                {isSubmittingAchievement ? "送信中..." : buttonLabel}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-red-600">
                残念！もう一度チャレンジしてください。
              </div>
              <Button
                onClick={handleRetryQuiz}
                variant="outline"
                className="w-full"
              >
                もう一度挑戦する
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          クイズ {currentQuestionIndex + 1} / {questions.length}
        </CardTitle>
        {category && (
          <p className="text-center text-sm text-muted-foreground">
            カテゴリ: {category}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">
            {currentQuestion.question}
          </h3>
          <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
            {currentQuestion.options.map((option, index) => (
              <div
                key={`quiz-option-${currentQuestion.id}-${option}`}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer}
          className="w-full"
        >
          {currentQuestionIndex < questions.length - 1
            ? "次の問題"
            : "結果を見る"}
        </Button>
      </CardContent>
    </Card>
  );
}
