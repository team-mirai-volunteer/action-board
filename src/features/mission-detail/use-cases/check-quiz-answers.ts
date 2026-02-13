import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";
import {
  gradeQuizAnswers,
  type QuizAnswer,
  type QuizGradeResult,
  type QuizQuestion,
  transformQuizRow,
} from "../utils/quiz-grader";

export type CheckQuizAnswersInput = {
  missionId: string;
  answers: QuizAnswer[];
};

export type CheckQuizAnswersResult =
  | ({
      success: true;
    } & QuizGradeResult)
  | { success: false; error: string };

/**
 * Fetch quiz questions for a mission using the provided Supabase client (admin).
 */
async function getQuestionsByMission(
  adminSupabase: SupabaseClient<Database>,
  missionId: string,
): Promise<QuizQuestion[]> {
  const { data, error } = await adminSupabase
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
    throw new Error(
      `クイズ問題の取得に失敗しました: ${error.message || "Unknown error"}`,
    );
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(transformQuizRow);
}

export async function checkQuizAnswers(
  adminSupabase: SupabaseClient<Database>,
  input: CheckQuizAnswersInput,
): Promise<CheckQuizAnswersResult> {
  const { missionId, answers } = input;

  const questions = await getQuestionsByMission(adminSupabase, missionId);

  if (!questions || questions.length === 0) {
    return {
      success: false,
      error: "このミッションにはクイズ問題が設定されていません",
    };
  }

  const gradeResult = gradeQuizAnswers(questions, answers);

  return {
    success: true,
    ...gradeResult,
  };
}
