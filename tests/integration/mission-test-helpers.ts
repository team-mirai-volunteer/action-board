import { randomUUID } from "node:crypto";
import { adminClient } from "../supabase/utils";

export type TestMission = {
  id: string;
  slug: string;
  title: string;
};

/**
 * テスト用ミッションを作成する。
 * テスト終了後に cleanupTestMission で削除すること。
 */
export async function createTestMission(params?: {
  slug?: string;
  title?: string;
  difficulty?: number;
  requiredArtifactType?: string;
  maxAchievementCount?: number | null;
  isFeatured?: boolean;
}): Promise<TestMission> {
  const slug = params?.slug ?? `test-mission-${Date.now()}`;
  const title = params?.title ?? `テストミッション ${Date.now()}`;

  // Get a current active season
  const { data: season, error: seasonError } = await adminClient
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (seasonError || !season) {
    throw new Error(
      `アクティブシーズンの取得に失敗しました: ${seasonError?.message}`,
    );
  }

  const missionId = randomUUID();
  const { data, error } = await adminClient
    .from("missions")
    .insert({
      id: missionId,
      slug,
      title,
      difficulty: params?.difficulty ?? 1,
      required_artifact_type: params?.requiredArtifactType ?? "NONE",
      max_achievement_count:
        params?.maxAchievementCount !== undefined
          ? params.maxAchievementCount
          : 1,
      is_featured: params?.isFeatured ?? false,
      is_hidden: false,
    })
    .select("id, slug, title")
    .single();

  if (error || !data) {
    throw new Error(`テストミッションの作成に失敗しました: ${error?.message}`);
  }

  return data;
}

/**
 * テスト用ミッションを削除する。
 * 関連する achievements, mission_artifacts は CASCADE で削除される。
 */
export async function cleanupTestMission(missionId: string): Promise<void> {
  // Get all artifacts for achievements of this mission
  const { data: achievements } = await adminClient
    .from("achievements")
    .select("id")
    .eq("mission_id", missionId);

  if (achievements && achievements.length > 0) {
    const achievementIds = achievements.map((a) => a.id);
    const { data: artifacts } = await adminClient
      .from("mission_artifacts")
      .select("id")
      .in("achievement_id", achievementIds);

    if (artifacts && artifacts.length > 0) {
      const artifactIds = artifacts.map((a) => a.id);
      // Delete posting_activities and poster_activities
      await adminClient
        .from("posting_activities")
        .delete()
        .in("mission_artifact_id", artifactIds);
      await adminClient
        .from("poster_activities")
        .delete()
        .in("mission_artifact_id", artifactIds);
    }
  }

  // Delete related xp_transactions first (not cascaded)
  await adminClient
    .from("xp_transactions")
    .delete()
    .eq("source_type", "MISSION_COMPLETION")
    .filter("description", "ilike", `%テストミッション%`);

  // Delete BONUS xp_transactions
  await adminClient
    .from("xp_transactions")
    .delete()
    .eq("source_type", "BONUS")
    .filter("description", "ilike", `%ボーナス%`);

  // Delete MISSION_CANCELLATION xp_transactions
  await adminClient
    .from("xp_transactions")
    .delete()
    .eq("source_type", "MISSION_CANCELLATION")
    .filter("description", "ilike", `%テストミッション%`);

  // Delete achievements (cascades to mission_artifacts)
  await adminClient.from("achievements").delete().eq("mission_id", missionId);

  // Delete the mission itself
  await adminClient.from("missions").delete().eq("id", missionId);
}

/**
 * テスト用クイズ問題を作成する。
 */
export async function createTestQuizQuestions(
  missionId: string,
  questions?: Array<{
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correctAnswer: number;
    explanation?: string;
  }>,
): Promise<string[]> {
  // Get or create a quiz category
  let categoryId: string;
  const { data: existingCategory } = await adminClient
    .from("quiz_categories")
    .select("id")
    .eq("name", "テストカテゴリ")
    .maybeSingle();

  if (existingCategory) {
    categoryId = existingCategory.id;
  } else {
    const { data: newCategory, error: categoryError } = await adminClient
      .from("quiz_categories")
      .insert({ name: "テストカテゴリ", slug: "test-category" })
      .select("id")
      .single();

    if (categoryError || !newCategory) {
      throw new Error(
        `テストカテゴリの作成に失敗しました: ${categoryError?.message}`,
      );
    }
    categoryId = newCategory.id;
  }

  const defaultQuestions = questions ?? [
    {
      question: "1+1は？",
      option1: "1",
      option2: "2",
      option3: "3",
      option4: "4",
      correctAnswer: 2,
      explanation: "1+1=2です",
    },
    {
      question: "2+2は？",
      option1: "2",
      option2: "3",
      option3: "4",
      option4: "5",
      correctAnswer: 3,
      explanation: "2+2=4です",
    },
  ];

  const insertData = defaultQuestions.map((q, i) => ({
    mission_id: missionId,
    category_id: categoryId,
    question: q.question,
    option1: q.option1,
    option2: q.option2,
    option3: q.option3,
    option4: q.option4,
    correct_answer: q.correctAnswer,
    explanation: q.explanation ?? null,
    question_order: i + 1,
  }));

  const { data, error } = await adminClient
    .from("quiz_questions")
    .insert(insertData)
    .select("id");

  if (error || !data) {
    throw new Error(`テストクイズ問題の作成に失敗しました: ${error?.message}`);
  }

  return data.map((d) => d.id);
}

/**
 * テスト用クイズ問題を削除する。
 */
export async function cleanupTestQuizQuestions(
  questionIds: string[],
): Promise<void> {
  if (questionIds.length === 0) return;
  await adminClient.from("quiz_questions").delete().in("id", questionIds);
}

/**
 * テスト用のユーザーレベルを初期化する。
 */
export async function initializeTestUserLevel(userId: string): Promise<void> {
  const { data: season } = await adminClient
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!season) {
    throw new Error("アクティブシーズンが見つかりません");
  }

  // Check if already exists
  const { data: existing } = await adminClient
    .from("user_levels")
    .select("id")
    .eq("user_id", userId)
    .eq("season_id", season.id)
    .maybeSingle();

  if (!existing) {
    await adminClient.from("user_levels").insert({
      user_id: userId,
      season_id: season.id,
      xp: 0,
      level: 1,
    });
  }
}

/**
 * テスト用ユーザーのXPを取得する。
 */
export async function getTestUserXp(
  userId: string,
): Promise<{ xp: number; level: number } | null> {
  const { data: season } = await adminClient
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (!season) return null;

  const { data } = await adminClient
    .from("user_levels")
    .select("xp, level")
    .eq("user_id", userId)
    .eq("season_id", season.id)
    .maybeSingle();

  return data;
}

/**
 * テスト用のXPトランザクションをクリーンアップする。
 */
export async function cleanupTestXpTransactions(userId: string): Promise<void> {
  await adminClient.from("xp_transactions").delete().eq("user_id", userId);
}

/**
 * テスト用のユーザーレベルをクリーンアップする。
 */
export async function cleanupTestUserLevel(userId: string): Promise<void> {
  await adminClient.from("user_levels").delete().eq("user_id", userId);
}
