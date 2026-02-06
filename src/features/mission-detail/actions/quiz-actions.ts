"use server";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import {
  gradeQuizAnswers,
  type QuizAnswer,
  type QuizQuestion,
  transformQuizRow,
} from "../utils/quiz-grader";

export type { QuizQuestion };

// ミッションリンクの型定義
export interface MissionLink {
  link: string;
  remark: string | null;
  display_order: number;
}

// ミッションのクイズカテゴリ取得関数
async function getMissionQuizCategory(
  missionId: string,
): Promise<string | null> {
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

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

  return data.map(transformQuizRow);
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
    const supabase = await createAdminClient();

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
    const supabase = createClient();

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
    const gradeResult = gradeQuizAnswers(questions, answers as QuizAnswer[]);

    return {
      success: true,
      ...gradeResult,
    };
  } catch (error) {
    console.error("Error checking quiz answers:", error);
    return { success: false, error: "クイズの採点に失敗しました" };
  }
};
