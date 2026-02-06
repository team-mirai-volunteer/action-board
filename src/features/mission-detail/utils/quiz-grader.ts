// クイズ用の型定義
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  category?: string;
}

// DB行データの型定義
export interface QuizQuestionRow {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_answer: number;
  explanation: string | null;
  quiz_categories: { name: string } | { name: string }[] | null;
}

/**
 * DBの行データをQuizQuestion型に変換する
 * option1〜option4の個別カラムをoptions配列に変換し、カテゴリ名を抽出する
 */
export function transformQuizRow(row: QuizQuestionRow): QuizQuestion {
  const category = Array.isArray(row.quiz_categories)
    ? row.quiz_categories[0]
    : row.quiz_categories;
  return {
    id: row.id,
    question: row.question,
    options: [row.option1, row.option2, row.option3, row.option4],
    correct_answer: row.correct_answer,
    explanation: row.explanation,
    category: category?.name || "その他",
  };
}

// 回答の型定義
export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
}

// 採点結果の型定義
export interface QuizAnswerResult {
  questionId: string;
  correct: boolean;
  explanation: string;
  selectedAnswer: number;
  correctAnswer: number;
}

export interface QuizGradeResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  results: QuizAnswerResult[];
}

/**
 * クイズの回答を正解と照合し、スコア・合否を計算する
 * 全問正解が合格条件
 */
export function gradeQuizAnswers(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
): QuizGradeResult {
  const results = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) {
      return {
        questionId: answer.questionId,
        correct: false,
        explanation: "",
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: 0,
      };
    }

    const isCorrect = question.correct_answer === answer.selectedAnswer;
    return {
      questionId: answer.questionId,
      correct: isCorrect,
      explanation: question.explanation || "",
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: question.correct_answer,
    };
  });

  const correctCount = results.filter((r) => r.correct).length;
  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = correctCount === totalQuestions;

  return {
    score,
    passed,
    correctAnswers: correctCount,
    totalQuestions,
    results,
  };
}
