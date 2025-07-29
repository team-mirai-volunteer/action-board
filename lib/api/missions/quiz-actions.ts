"use server";

import { createClient } from "@/lib/supabase/server";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category?: string;
}

export interface MissionLink {
  id: string;
  mission_id: string;
  title: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export async function getQuizCategoriesAction() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("quiz_categories")
      .select("id, name")
      .eq("is_active", true);

    if (error) {
      console.error("Quiz categories fetch error:", error);
      return { success: false, error: "カテゴリの取得に失敗しました" };
    }

    const categories = data.map((item) => ({
      id: item.id,
      name: item.name,
    }));

    return { success: true, categories };
  } catch (error) {
    console.error("Quiz categories error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

export async function getQuizQuestionsAction(categoryId?: string) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("quiz_questions")
      .select("id, question, option1, option2, option3, option4, category_id")
      .eq("is_active", true);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error("Quiz questions fetch error:", error);
      return { success: false, error: "問題の取得に失敗しました" };
    }

    const questions: QuizQuestion[] = data.map((item) => ({
      id: item.id,
      question: item.question,
      options: [item.option1, item.option2, item.option3, item.option4],
      category: item.category_id,
    }));

    return { success: true, questions };
  } catch (error) {
    console.error("Quiz questions error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

export async function checkQuizAnswersAction(
  questionIds: string[],
  answers: string[],
) {
  const supabase = await createClient();

  try {
    if (questionIds.length !== answers.length) {
      return { success: false, error: "問題と回答の数が一致しません" };
    }

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, correct_answer")
      .in("id", questionIds);

    if (error) {
      console.error("Quiz answers check error:", error);
      return { success: false, error: "回答の確認に失敗しました" };
    }

    const correctAnswers = new Map(
      data.map((item) => [item.id, item.correct_answer.toString()]),
    );

    let correctCount = 0;
    const results = questionIds.map((questionId, index) => {
      const userAnswer = answers[index];
      const correctAnswer = correctAnswers.get(questionId);
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      return {
        questionId,
        userAnswer,
        correctAnswer,
        isCorrect,
      };
    });

    const score = Math.round((correctCount / questionIds.length) * 100);
    const passed = score >= 70;

    return {
      success: true,
      results,
      score,
      passed,
      correctCount,
      totalQuestions: questionIds.length,
    };
  } catch (error) {
    console.error("Quiz answers check error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

export async function getMissionLinksAction(missionId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("mission_main_links")
      .select("*")
      .eq("mission_id", missionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Mission links fetch error:", error);
      return { success: false, error: "リンクの取得に失敗しました" };
    }

    const links: MissionLink[] = data.map((item) => ({
      id: item.id,
      mission_id: item.mission_id,
      title: item.label,
      url: item.link,
      description: undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    return { success: true, links };
  } catch (error) {
    console.error("Mission links error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}

export async function submitQuizResultAction(
  missionId: string,
  questionIds: string[],
  answers: string[],
  score: number,
  passed: boolean,
) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "認証が必要です" };
    }

    const quizData = {
      question_ids: questionIds,
      answers: answers,
      score: score,
      passed: passed,
    };

    const { data: achievementData, error: achievementError } = await supabase
      .from("achievements")
      .insert({
        user_id: user.id,
        mission_id: missionId,
      })
      .select()
      .single();

    if (achievementError) {
      console.error("Quiz achievement error:", achievementError);
      return { success: false, error: "達成記録の保存に失敗しました" };
    }

    const { data: insertData, error: insertError } = await supabase
      .from("mission_artifacts")
      .insert({
        achievement_id: achievementData.id,
        user_id: user.id,
        artifact_type: "QUIZ",
        description: `クイズ結果: ${score}点 (${passed ? "合格" : "不合格"})`,
        text_content: JSON.stringify(quizData),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Quiz result insert error:", insertError);
      return { success: false, error: "クイズ結果の保存に失敗しました" };
    }

    if (passed) {
      return {
        success: true,
        passed: true,
        achievementId: achievementData.id,
        artifactId: insertData.id,
      };
    }

    return {
      success: true,
      passed: false,
      artifactId: insertData.id,
    };
  } catch (error) {
    console.error("Quiz result submission error:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
