"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";

// クイズ用の型定義
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  category?: string; // カテゴリー名を追加
}

// ミッションリンクの型定義
export interface MissionLink {
  link: string;
  remark: string | null;
  display_order: number;
}

// データベースから取得されるクイズ問題の型
interface DbQuizQuestion {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_answer: number;
  explanation: string | null;
}

// quiz_questionsテーブルから直接取得される問題の型
interface MissionQuizQuestion extends DbQuizQuestion {
  question_order: number;
  quiz_categories: {
    name: string;
  };
}

// ミッションのクイズカテゴリ取得関数
async function getMissionQuizCategory(
  missionId: string,
): Promise<string | null> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(`
      quiz_categories (
        name
      )
    `)
    .eq("mission_id", missionId)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.warn("Category fetch error:", error?.message || "No data");
    return null;
  }

  const firstItem = data[0];
  const category = Array.isArray(firstItem.quiz_categories)
    ? firstItem.quiz_categories[0]
    : firstItem.quiz_categories;

  return category?.name || null;
}

// ミッション用のクイズ問題取得関数
async function getQuestionsByMission(
  missionId: string,
): Promise<QuizQuestion[]> {
  const supabase = await createServiceClient();

  // ミッションに紐づく問題を直接取得
  const { data, error } = await supabase
    .from("quiz_questions")
    .select(`
      id,
      question,
      option1,
      option2,
      option3,
      option4,
      correct_answer,
      explanation,
      question_order,
      quiz_categories (
        name
      )
    `)
    .eq("mission_id", missionId)
    .order("question_order");

  if (error) {
    console.error("Error fetching quiz questions:", error);
    console.error("Mission ID:", missionId);
    throw new Error(
      `クイズ問題の取得に失敗しました: ${error.message || "Unknown error"}`,
    );
  }

  if (!data || data.length === 0) {
    console.warn("No quiz questions found for mission:", missionId);
    return [];
  }

  return data.map((q) => {
    const category = Array.isArray(q.quiz_categories)
      ? q.quiz_categories[0]
      : q.quiz_categories;
    return {
      id: q.id,
      question: q.question,
      options: [q.option1, q.option2, q.option3, q.option4],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      category: category?.name || "その他",
    };
  });
}

// === クイズ関連のServer Actions ===

// ミッションのクイズカテゴリを取得する
export const getMissionQuizCategoryAction = async (missionId: string) => {
  try {
    const category = await getMissionQuizCategory(missionId);
    return {
      success: true,
      category: category || "その他",
    };
  } catch (error) {
    console.error("Error fetching quiz category:", error);
    return {
      success: false,
      error: "カテゴリの取得に失敗しました",
      category: "その他",
    };
  }
};

// ミッションのリンクを取得する
export const getMissionLinksAction = async (missionId: string) => {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("mission_quiz_links")
      .select("link, remark, display_order")
      .eq("mission_id", missionId)
      .order("display_order");

    if (error) {
      console.error("Error fetching mission links:", error);
      return {
        success: false,
        error: "リンクの取得に失敗しました",
        links: [] as MissionLink[],
      };
    }

    return {
      success: true,
      links: data || [],
    };
  } catch (error) {
    console.error("Error fetching mission links:", error);
    return {
      success: false,
      error: "リンクの取得に失敗しました",
      links: [] as MissionLink[],
    };
  }
};

// ミッションのクイズ問題を取得する
export const getQuizQuestionsAction = async (missionId: string) => {
  try {
    // ミッションに紐づく問題を取得
    const questions = await getQuestionsByMission(missionId);

    if (!questions || questions.length === 0) {
      return {
        success: false,
        error: "このミッションにはクイズ問題が設定されていません",
      };
    }

    return {
      success: true,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        category: q.category,
      })),
    };
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return {
      success: false,
      error: "クイズ問題の取得に失敗しました",
    };
  }
};

// クイズの回答をチェックする（採点のみ、achievements記録なし）
export const checkQuizAnswersAction = async (
  missionId: string,
  answers: { questionId: string; selectedAnswer: number }[],
) => {
  try {
    const supabase = await createClient();

    // ユーザー認証確認
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "認証が必要です" };
    }

    // ミッションに紐づく問題を取得（正解と照合するため）
    const questions = await getQuestionsByMission(missionId);

    if (!questions || questions.length === 0) {
      return {
        success: false,
        error: "このミッションにはクイズ問題が設定されていません",
      };
    }

    // 回答チェック
    const results = answers.map((answer) => {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) {
        return {
          questionId: answer.questionId,
          correct: false,
          explanation: "",
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: 0, // デフォルト値
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
    const passed = correctCount === totalQuestions; // 全問正解が合格条件

    return {
      success: true,
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions,
      results,
    };
  } catch (error) {
    console.error("Error checking quiz answers:", error);
    return { success: false, error: "クイズの採点に失敗しました" };
  }
};
