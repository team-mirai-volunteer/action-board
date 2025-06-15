"use server";

import { ARTIFACT_TYPES } from "@/lib/artifactTypes"; // パス変更
import { grantMissionCompletionXp, grantXp } from "@/lib/services/userLevel";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calculateMissionXp } from "@/lib/utils/utils";

import { POSTING_POINTS_PER_UNIT } from "@/lib/constants";
import type { TablesInsert } from "@/lib/types/supabase";
import { z } from "zod";

// クイズ用の型定義
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: number;
  correct_answer: number;
  explanation: string | null;
  category?: string; // カテゴリー名を追加
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
  explanation: string;
  difficulty: number;
}

// mission_quiz_questionsテーブルからの結果型
interface MissionQuizQuestionResult {
  question_order: number;
  quiz_questions: DbQuizQuestion;
}

// ミッション用のクイズ問題取得関数
async function getQuestionsByMission(
  missionId: string,
): Promise<QuizQuestion[]> {
  console.log("Fetching quiz questions for mission:", missionId);
  const supabase = await createServiceClient();

  // ミッションに紐づく問題を取得（mission_quiz_questionsテーブル経由）
  const { data, error } = await supabase
    .from("mission_quiz_questions")
    .select(`
      question_order,
      quiz_questions (
        id,
        question,
        option1,
        option2,
        option3,
        option4,
        correct_answer,
        explanation,
        difficulty,
        quiz_categories (
          name
        )
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

  console.log("Retrieved quiz questions:", data?.length || 0);

  if (!data || data.length === 0) {
    console.warn("No quiz questions found for mission:", missionId);
    return [];
  }

  return data.map((item) => {
    const q = Array.isArray(item.quiz_questions)
      ? item.quiz_questions[0]
      : item.quiz_questions;
    // const category = Array.isArray(q.quiz_categories) 
    //   ? q.quiz_categories[0]?.name 
    //   : q.quiz_categories?.name;
    return {
      id: q.id,
      question: q.question,
      options: [q.option1, q.option2, q.option3, q.option4],
      difficulty: q.difficulty,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      // category: category || null,
    };
  });
}

// 基本スキーマ（共通項目）
const baseMissionFormSchema = z.object({
  missionId: z.string().nonempty({ message: "ミッションIDが必要です" }),
  requiredArtifactType: z
    .string()
    .nonempty({ message: "提出タイプが必要です" }),
  artifactDescription: z.string().optional(),
});

// LINKタイプ用スキーマ
const linkArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.LINK.key),
  artifactLink: z
    .string()
    .nonempty({ message: "リンクURLが必要です" })
    .url({ message: "有効なURLを入力してください" }),
});

// TEXTタイプ用スキーマ
const textArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.TEXT.key),
  artifactText: z.string().nonempty({ message: "テキストが必要です" }),
});

// EMAILタイプ用スキーマ
const emailArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.EMAIL.key),
  artifactEmail: z
    .string()
    .nonempty({ message: "メールアドレスが必要です" })
    .email({ message: "有効なメールアドレスを入力してください" }),
});

// IMAGEタイプ用スキーマ
const imageArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.IMAGE.key),
  artifactImagePath: z.string().nonempty({ message: "画像が必要です" }),
});

// IMAGE_WITH_GEOLOCATIONタイプ用スキーマ
const imageWithGeolocationArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key),
  artifactImagePath: z.string().nonempty({ message: "画像が必要です" }),
  latitude: z
    .string()
    .nonempty({ message: "緯度が必要です" })
    .refine((val) => !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な緯度を入力してください",
    }),
  longitude: z
    .string()
    .nonempty({ message: "経度が必要です" })
    .refine((val) => !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な経度を入力してください",
    }),
  accuracy: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な精度を入力してください",
    }),
  altitude: z
    .string()
    .optional()
    .refine((val) => !val || !Number.isNaN(Number.parseFloat(val)), {
      message: "有効な高度を入力してください",
    }),
});

// NONEタイプ用スキーマ
const noneArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.NONE.key),
});

// POSTINGタイプ用スキーマ
const postingArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.POSTING.key),
  postingCount: z.coerce
    .number()
    .min(1, { message: "ポスティング枚数は1枚以上で入力してください" })
    .max(1000, { message: "ポスティング枚数は1000枚以下で入力してください" }),
  locationText: z
    .string()
    .min(1, { message: "ポスティング場所を入力してください" })
    .max(100, { message: "ポスティング場所は100文字以下で入力してください" }),
});

// QUIZタイプ用スキーマ（sessionIdは不要）
const quizArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.QUIZ.key),
});

// 統合スキーマ
const achieveMissionFormSchema = z.discriminatedUnion("requiredArtifactType", [
  linkArtifactSchema,
  textArtifactSchema,
  emailArtifactSchema,
  imageArtifactSchema,
  imageWithGeolocationArtifactSchema,
  noneArtifactSchema,
  postingArtifactSchema,
  quizArtifactSchema, // 追加
]);

// 提出キャンセルアクションのバリデーションスキーマ
const cancelSubmissionFormSchema = z.object({
  achievementId: z.string().nonempty({ message: "達成IDが必要です" }),
  missionId: z.string().nonempty({ message: "ミッションIDが必要です" }),
});

export const achieveMissionAction = async (formData: FormData) => {
  const supabase = await createClient();
  const missionId = formData.get("missionId")?.toString();
  const requiredArtifactType = formData.get("requiredArtifactType")?.toString();
  const artifactLink = formData.get("artifactLink")?.toString();
  const artifactText = formData.get("artifactText")?.toString();
  const artifactEmail = formData.get("artifactEmail")?.toString();
  const artifactImagePath = formData.get("artifactImagePath")?.toString();
  const artifactDescription = formData.get("artifactDescription")?.toString();
  // 位置情報データの取得
  const latitude = formData.get("latitude")?.toString();
  const longitude = formData.get("longitude")?.toString();
  const accuracy = formData.get("accuracy")?.toString();
  const altitude = formData.get("altitude")?.toString();
  // ポスティング用データの取得
  const postingCount = formData.get("postingCount")?.toString();
  const locationText = formData.get("locationText")?.toString();

  const validatedFields = achieveMissionFormSchema.safeParse({
    missionId,
    requiredArtifactType,
    artifactLink,
    artifactText,
    artifactEmail,
    artifactImagePath,
    artifactDescription,
    latitude,
    longitude,
    accuracy,
    altitude,
    postingCount,
    locationText,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
    };
  }

  const validatedData = validatedFields.data;
  const {
    missionId: validatedMissionId,
    requiredArtifactType: validatedRequiredArtifactType,
    artifactDescription: validatedArtifactDescription,
  } = validatedData;

  // ユーザーがログイン済みかチェック (念のため)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return {
      success: false,
      error: "認証エラーが発生しました。",
    };
  }

  // ミッション情報を取得して、max_achievement_count を確認
  const { data: missionData, error: missionFetchError } = await supabase
    .from("missions")
    .select("max_achievement_count")
    .eq("id", validatedMissionId)
    .single();

  if (missionFetchError) {
    console.error(`Mission fetch error: ${missionFetchError.message}`);
    return {
      success: false,
      error: "ミッション情報の取得に失敗しました。",
    };
  }

  if (missionData?.max_achievement_count !== null) {
    // ユーザーの達成回数を取得
    const { data: userAchievements, error: userAchievementError } =
      await supabase
        .from("achievements")
        .select("id", { count: "exact" })
        .eq("user_id", authUser.id)
        .eq("mission_id", validatedMissionId);

    if (userAchievementError) {
      console.error(
        `User achievement count fetch error: ${userAchievementError.message}`,
      );
      return {
        success: false,
        error: "ユーザーの達成回数の取得に失敗しました。",
      };
    }

    // ユーザーの達成回数が最大達成回数に達しているかチェック
    if (
      userAchievements &&
      typeof missionData.max_achievement_count === "number" &&
      userAchievements.length >= missionData.max_achievement_count
    ) {
      return {
        success: false,
        error: "あなたはこのミッションの達成回数の上限に達しています。",
      };
    }
  }

  // ミッション達成を記録
  const achievementPayload = {
    user_id: authUser.id,
    mission_id: validatedMissionId,
  };

  const { data: achievement, error: achievementError } = await supabase
    .from("achievements")
    .insert(achievementPayload)
    .select("id")
    .single();

  if (achievementError) {
    console.error(
      `Achievement Error: ${achievementError.code} ${achievementError.message}`,
    );
    return {
      success: false,
      error: `ミッション達成の記録に失敗しました: ${achievementError.message}`,
    };
  }

  if (!achievement) {
    return {
      success: false,
      error: "達成記録の作成に失敗しました。",
    };
  }

  // 成果物がある場合は mission_artifacts に記録
  if (
    validatedRequiredArtifactType &&
    validatedRequiredArtifactType !== ARTIFACT_TYPES.NONE.key
  ) {
    const artifactPayload: TablesInsert<"mission_artifacts"> = {
      achievement_id: achievement.id,
      user_id: authUser.id,
      artifact_type: validatedRequiredArtifactType,
      description: validatedArtifactDescription || null,
    };

    let artifactTypeLabel = "OTHER";
    let validationError = null;

    // formDataの内容を全てログ出力
    const formDataObj: Record<string, string> = {};
    formData.forEach((value, key) => {
      formDataObj[key] = String(value);
    });

    if (validatedRequiredArtifactType === ARTIFACT_TYPES.LINK.key) {
      artifactTypeLabel = "LINK";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.LINK.key) {
        artifactPayload.link_url = validatedData.artifactLink;
        // CHECK制約: link_url必須、他はnull
        artifactPayload.image_storage_path = null;
        artifactPayload.text_content = null;
      }
    } else if (validatedRequiredArtifactType === ARTIFACT_TYPES.TEXT.key) {
      artifactTypeLabel = "TEXT";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.TEXT.key) {
        artifactPayload.text_content = validatedData.artifactText;
        // CHECK制約: text_content必須、他はnull
        artifactPayload.link_url = null;
        artifactPayload.image_storage_path = null;
      }
    } else if (validatedRequiredArtifactType === ARTIFACT_TYPES.EMAIL.key) {
      artifactTypeLabel = "EMAIL";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.EMAIL.key) {
        artifactPayload.text_content = validatedData.artifactEmail;
        // CHECK制約: text_content必須、他はnull
        artifactPayload.link_url = null;
        artifactPayload.image_storage_path = null;
      }
    } else if (validatedRequiredArtifactType === ARTIFACT_TYPES.IMAGE.key) {
      artifactTypeLabel = "IMAGE";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.IMAGE.key) {
        artifactPayload.image_storage_path = validatedData.artifactImagePath;
        // CHECK制約: image_storage_path必須、他はnull
        artifactPayload.link_url = null;
        artifactPayload.text_content = null;
      }
    } else if (
      validatedRequiredArtifactType ===
      ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
    ) {
      artifactTypeLabel = "IMAGE_WITH_GEOLOCATION";
      if (
        validatedData.requiredArtifactType ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
      ) {
        artifactPayload.image_storage_path = validatedData.artifactImagePath;
        artifactPayload.link_url = null;
        artifactPayload.text_content = null;
      }
    } else if (validatedRequiredArtifactType === ARTIFACT_TYPES.POSTING.key) {
      artifactTypeLabel = "POSTING";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.POSTING.key) {
        // ポスティング情報をtext_contentに格納
        artifactPayload.text_content = `${validatedData.postingCount}枚を${validatedData.locationText}に配布`;
        // CHECK制約: text_content必須、他はnull
        artifactPayload.link_url = null;
        artifactPayload.image_storage_path = null;
      }
    } else if (validatedRequiredArtifactType === ARTIFACT_TYPES.QUIZ.key) {
      console.log("Processing QUIZ artifact type");
      artifactTypeLabel = "QUIZ";
      if (validatedData.requiredArtifactType === ARTIFACT_TYPES.QUIZ.key) {
        console.log("QUIZ validation passed, setting artifact data:", {
          artifactDescription: validatedArtifactDescription,
        });
        // クイズ結果をdescriptionに格納（既にvalidatedArtifactDescriptionに含まれている）
        // CHECK制約回避のためtext_contentにも格納
        artifactPayload.text_content =
          validatedArtifactDescription || "クイズ完了";
        artifactPayload.link_url = null;
        artifactPayload.image_storage_path = null;
        console.log("Final QUIZ artifactPayload:", artifactPayload);
      }
    } else {
      // その他のタイプは全てnullに
      artifactPayload.link_url = null;
      artifactPayload.image_storage_path = null;
      artifactPayload.text_content = null;
    }

    // CHECK制約: link_url、text_content、image_storage_pathのいずれか一つは必須
    if (
      !artifactPayload.link_url &&
      !artifactPayload.image_storage_path &&
      !artifactPayload.text_content
    ) {
      validationError =
        validationError ||
        "リンク、テキスト、または画像のいずれかは必須です（CHECK制約違反防止）";
    }

    // バリデーションエラー時は詳細ログとともにリダイレクト
    if (validationError) {
      console.error(
        `[Artifact Validation Error] type=${artifactTypeLabel} payload=`,
        artifactPayload,
        "formData:",
        formDataObj,
        "error:",
        validationError,
      );
      return {
        success: false,
        error: validationError,
      };
    }

    // insert前にpayloadと分岐情報を出力
    console.log(`[Artifact Insert] type=${artifactTypeLabel}`, artifactPayload);

    const { data: newArtifact, error: artifactError } = await supabase
      .from("mission_artifacts")
      .insert(artifactPayload)
      .select("id") // 作成された artifact の ID を取得
      .single();

    if (artifactError) {
      console.error(
        `[Artifact Error] type=${artifactTypeLabel} payload=`,
        artifactPayload,
        "formData:",
        formDataObj,
        `error= ${artifactError.code} ${artifactError.message}`,
      );
      return {
        success: false,
        error: `成果物の保存に失敗しました: ${artifactError.message}`,
      };
    }

    if (!newArtifact) {
      return {
        success: false,
        error: "成果物レコードの作成に失敗しました。",
      };
    }

    // 位置情報がある場合は mission_artifact_geolocations に記録
    if (
      validatedRequiredArtifactType ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key &&
      validatedData.requiredArtifactType ===
        ARTIFACT_TYPES.IMAGE_WITH_GEOLOCATION.key
    ) {
      const geolocationPayload: TablesInsert<"mission_artifact_geolocations"> =
        {
          mission_artifact_id: newArtifact.id,
          lat: Number.parseFloat(validatedData.latitude),
          lon: Number.parseFloat(validatedData.longitude),
          accuracy: validatedData.accuracy
            ? Number.parseFloat(validatedData.accuracy)
            : null,
          altitude: validatedData.altitude
            ? Number.parseFloat(validatedData.altitude)
            : null,
        };
      const { error: geoError } = await supabase
        .from("mission_artifact_geolocations")
        .insert(geolocationPayload);

      if (geoError) {
        console.error(
          `Geolocation Error: ${geoError.code} ${geoError.message}`,
        );
        // 成果物レコードは作成済みだが、位置情報保存に失敗した場合のハンドリング
        // ここではエラーメッセージを出すに留めるが、より丁寧なエラー処理も検討可能
        return {
          success: false,
          error: `位置情報の保存に失敗しました: ${geoError.message}`,
        };
      }
    }

    // ポスティング活動の詳細情報を保存
    if (
      validatedRequiredArtifactType === ARTIFACT_TYPES.POSTING.key &&
      validatedData.requiredArtifactType === ARTIFACT_TYPES.POSTING.key
    ) {
      const { error: postingError } = await supabase
        .from("posting_activities")
        .insert({
          mission_artifact_id: newArtifact.id,
          posting_count: validatedData.postingCount,
          location_text: validatedData.locationText,
        });

      if (postingError) {
        console.error("Posting activity save error:", postingError);
        return {
          success: false,
          error: `ポスティング活動の保存に失敗しました: ${postingError.message}`,
        };
      }

      // ポスティング用のポイント計算とXP付与
      const pointsPerUnit = POSTING_POINTS_PER_UNIT; // 固定値（フェーズ1では固定、フェーズ2で設定テーブルから取得予定）
      const totalPoints = validatedData.postingCount * pointsPerUnit;

      // 通常のXP（ミッション難易度ベース）に加えて、ポスティングボーナスXPを付与
      const bonusXpResult = await grantXp(
        authUser.id,
        totalPoints,
        "BONUS",
        achievement.id,
        `ポスティング活動ボーナス（${validatedData.postingCount}枚×${pointsPerUnit}ポイント）`,
      );

      if (!bonusXpResult.success) {
        console.error(
          "ポスティングボーナスXP付与に失敗しました:",
          bonusXpResult.error,
        );
        // ボーナスXP付与の失敗はミッション達成の成功を妨げない
      }
    }
  }

  // ミッション達成時にXPを付与
  const xpResult = await grantMissionCompletionXp(
    authUser.id,
    validatedMissionId,
    achievement.id,
  );

  if (!xpResult.success) {
    console.error("XP付与に失敗しました:", xpResult.error);
    // XP付与の失敗はミッション達成の成功を妨げない
  }

  return {
    success: true,
    message: "ミッションを達成しました！",
    xpGranted: xpResult.xpGranted,
    userLevel: xpResult.userLevel,
  };
};

export const cancelSubmissionAction = async (formData: FormData) => {
  const achievementId = formData.get("achievementId")?.toString();
  const missionId = formData.get("missionId")?.toString();

  // zodによるバリデーション
  const validatedFields = cancelSubmissionFormSchema.safeParse({
    achievementId,
    missionId,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.errors
        .map((error) => error.message)
        .join("\n"),
    };
  }

  const {
    achievementId: validatedAchievementId,
    missionId: validatedMissionId,
  } = validatedFields.data;

  const supabase = await createClient();

  // ユーザーがログイン済みかチェック
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return { success: false, error: "認証エラーが発生しました。" };
  }

  // 達成記録が存在し、ユーザーのものかチェック
  const { data: achievement, error: achievementFetchError } = await supabase
    .from("achievements")
    .select("id, user_id, mission_id")
    .eq("id", validatedAchievementId)
    .eq("user_id", authUser.id)
    .single();

  if (achievementFetchError || !achievement) {
    console.error("Achievement fetch error:", achievementFetchError);
    return {
      success: false,
      error: "達成記録が見つからないか、アクセス権限がありません。",
    };
  }

  // mission_idがnullでないことを確認
  if (!achievement.mission_id) {
    return {
      success: false,
      error: "ミッションIDが見つかりません。",
    };
  }

  // ミッション情報を取得してXP計算のための難易度を確認
  const { data: missionData, error: missionFetchError } = await supabase
    .from("missions")
    .select("difficulty, title")
    .eq("id", achievement.mission_id)
    .single();

  if (missionFetchError || !missionData) {
    console.error("Mission fetch error:", missionFetchError);
    return {
      success: false,
      error: "ミッション情報の取得に失敗しました。",
    };
  }

  // 達成記録を削除（CASCADE により関連する mission_artifacts と mission_artifact_geolocations も削除される）
  const { error: deleteError } = await supabase
    .from("achievements")
    .delete()
    .eq("id", validatedAchievementId);

  if (deleteError) {
    console.error(`Delete Error: ${deleteError.code} ${deleteError.message}`);
    return {
      success: false,
      error: `達成の取り消しに失敗しました: ${deleteError.message}`,
    };
  }

  // XPを減算する（ミッション達成時に付与されたXPを取り消し）
  const xpToRevoke = calculateMissionXp(missionData.difficulty);
  const xpResult = await grantXp(
    authUser.id,
    -xpToRevoke, // 負の値でXPを減算
    "MISSION_CANCELLATION",
    validatedAchievementId,
    `ミッション「${missionData.title}」の提出取り消しによる経験値減算`,
  );

  if (!xpResult.success) {
    console.error("XP減算に失敗しました:", xpResult.error);
    // XP減算の失敗はエラーとして扱うが、達成記録は既に削除済み
    return {
      success: false,
      error: `達成の取り消しは完了しましたが、経験値の減算に失敗しました: ${xpResult.error}`,
    };
  }

  return {
    success: true,
    message: "達成を取り消しました。",
    xpRevoked: xpToRevoke,
    userLevel: xpResult.userLevel,
  };
};

// === クイズ関連のServer Actions ===

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
        difficulty: q.difficulty,
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
