"use server";

import { z } from "zod";
import { VALID_JP_PREFECTURES } from "@/features/map-poster/constants/poster-prefectures";
import { MAX_POSTING_COUNT } from "@/lib/constants/mission-config";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import { formatZodErrors } from "@/lib/utils/validation-utils";
import { achieveMission } from "../use-cases/achieve-mission";
import { cancelSubmission } from "../use-cases/cancel-submission";

// Quiz関連のServer Actionsをインポート
import {
  checkQuizAnswersAction,
  getMissionQuizCategoryAction,
  getQuizQuestionsAction,
} from "./quiz-actions";

// Quiz関連のServer Actionsを再エクスポート
export {
  getMissionQuizCategoryAction,
  getQuizQuestionsAction,
  checkQuizAnswersAction,
};

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
    .max(MAX_POSTING_COUNT, {
      message: `ポスティング枚数は${MAX_POSTING_COUNT}枚以下で入力してください`,
    }),
  locationText: z.string().optional(),
});

// POSTERタイプ用スキーマ
const posterArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.POSTER.key),
  prefecture: z
    .string()
    .min(1, { message: "都道府県を選択してください" })
    .refine(
      (val): val is (typeof VALID_JP_PREFECTURES)[number] =>
        VALID_JP_PREFECTURES.includes(
          val as (typeof VALID_JP_PREFECTURES)[number],
        ),
      {
        message: "有効な都道府県を選択してください",
      },
    ),
  city: z
    .string()
    .min(1, { message: "市町村＋区を入力してください" })
    .max(100, { message: "市町村＋区は100文字以下で入力してください" }),
  boardNumber: z
    .string()
    .min(1, { message: "番号を入力してください" })
    .max(20, { message: "番号は20文字以下で入力してください" }),
  boardName: z
    .string()
    .max(100, { message: "名前は100文字以下で入力してください" })
    .optional(),
  boardNote: z
    .string()
    .max(200, { message: "状況は200文字以下で入力してください" })
    .optional(),
  boardAddress: z
    .string()
    .max(200, { message: "住所は200文字以下で入力してください" })
    .optional(),
  boardLat: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number.parseFloat(val)) &&
          Number.parseFloat(val) >= -90 &&
          Number.parseFloat(val) <= 90),
      {
        message: "緯度は-90から90の間の数値で入力してください",
      },
    ),
  boardLong: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        (!Number.isNaN(Number.parseFloat(val)) &&
          Number.parseFloat(val) >= -180 &&
          Number.parseFloat(val) <= 180),
      {
        message: "経度は-180から180の間の数値で入力してください",
      },
    ),
});

// QUIZタイプ用スキーマ（sessionIdは不要）
const quizArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.QUIZ.key),
});

// LINK_ACCESSタイプ用スキーマ
const linkAccessArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.LINK_ACCESS.key),
});

// YOUTUBEタイプ用スキーマ
const youtubeArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.YOUTUBE.key),
  artifactLink: z
    .string()
    .nonempty({ message: "YouTube動画のURLが必要です" })
    .regex(ARTIFACT_TYPES.YOUTUBE.validationRegex, {
      message: "有効なYouTube動画のURLを入力してください",
    }),
});

// YOUTUBE_COMMENTタイプ用スキーマ
const youtubeCommentArtifactSchema = baseMissionFormSchema.extend({
  requiredArtifactType: z.literal(ARTIFACT_TYPES.YOUTUBE_COMMENT.key),
  artifactLink: z
    .string()
    .nonempty({ message: "YouTubeコメントのURLが必要です" }),
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
  posterArtifactSchema,
  quizArtifactSchema,
  linkAccessArtifactSchema,
  youtubeArtifactSchema,
  youtubeCommentArtifactSchema,
]);

export type AchieveMissionFormData = z.infer<typeof achieveMissionFormSchema>;

// 提出キャンセルアクションのバリデーションスキーマ
const cancelSubmissionFormSchema = z.object({
  achievementId: z.string().nonempty({ message: "達成IDが必要です" }),
  missionId: z.string().nonempty({ message: "ミッションIDが必要です" }),
});

export const achieveMissionAction = async (formData: FormData) => {
  const supabase = createClient();
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
  // ポスター用データの取得
  const prefecture = formData.get("prefecture")?.toString();
  const city = formData.get("city")?.toString();
  const boardNumber = formData.get("boardNumber")?.toString();
  const boardName = formData.get("boardName")?.toString();
  const boardNote = formData.get("boardNote")?.toString();
  const boardAddress = formData.get("boardAddress")?.toString();
  const boardLat = formData.get("boardLat")?.toString();
  const boardLong = formData.get("boardLong")?.toString();
  const boardId = formData.get("boardId")?.toString();

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
    prefecture,
    city,
    boardNumber,
    boardName,
    boardNote,
    boardAddress,
    boardLat,
    boardLong,
  });

  if (!validatedFields.success) {
    return {
      success: false as const,
      error: formatZodErrors(validatedFields.error),
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
      success: false as const,
      error: "認証エラーが発生しました。",
    };
  }

  // YouTube重複バリデーション（同じ動画へのいいねは1回のみ）
  if (
    validatedRequiredArtifactType === ARTIFACT_TYPES.YOUTUBE.key &&
    validatedData.requiredArtifactType === ARTIFACT_TYPES.YOUTUBE.key
  ) {
    const { extractVideoIdFromUrl } = await import(
      "@/features/youtube/services/youtube-like-service"
    );
    const videoId = extractVideoIdFromUrl(validatedData.artifactLink);

    if (videoId) {
      const { data: existingLike, error: likeCheckError } = await supabase
        .from("youtube_video_likes")
        .select("id")
        .eq("user_id", authUser.id)
        .eq("video_id", videoId)
        .maybeSingle();

      if (likeCheckError) {
        return {
          success: false as const,
          error: "重複チェック中にエラーが発生しました。",
        };
      }

      if (existingLike) {
        return {
          success: false as const,
          error: "この動画へのいいねは既に記録されています。",
        };
      }
    }
  }

  // YOUTUBE_COMMENT重複バリデーション（同じコメントは1回のみ）
  let validatedYouTubeCommentInfo: {
    videoId: string;
    commentId: string | null;
  } | null = null;
  if (
    validatedRequiredArtifactType === ARTIFACT_TYPES.YOUTUBE_COMMENT.key &&
    validatedData.requiredArtifactType === ARTIFACT_TYPES.YOUTUBE_COMMENT.key
  ) {
    const { extractVideoIdFromUrl, extractCommentIdFromUrl } = await import(
      "@/features/youtube/services/youtube-comment-service"
    );

    const videoId = extractVideoIdFromUrl(validatedData.artifactLink);
    const commentId = extractCommentIdFromUrl(validatedData.artifactLink);

    if (!videoId) {
      return {
        success: false as const,
        error: "YouTube動画のURLを正しく入力してください。",
      };
    }

    const { data: video, error: videoError } = await supabase
      .from("youtube_videos")
      .select("video_id")
      .eq("video_id", videoId)
      .eq("is_active", true)
      .maybeSingle();

    if (videoError) {
      return {
        success: false as const,
        error: "動画の確認中にエラーが発生しました。",
      };
    }

    if (!video) {
      return {
        success: false as const,
        error: "この動画はチームみらいの動画ではありません。",
      };
    }

    if (commentId) {
      const adminClient = await createAdminClient();
      const { data: existingComment, error: commentCheckError } =
        await adminClient
          .from("youtube_user_comments")
          .select("id")
          .eq("user_id", authUser.id)
          .eq("comment_id", commentId)
          .maybeSingle();

      if (commentCheckError) {
        return {
          success: false as const,
          error: "重複チェック中にエラーが発生しました。",
        };
      }

      if (existingComment) {
        return {
          success: false as const,
          error: "このコメントは既に記録されています。",
        };
      }
    }

    validatedYouTubeCommentInfo = { videoId, commentId };
  }

  // YouTubeミッション: チームみらい動画の検証（DB書き込み前に実行）
  let validatedYouTubeVideoId: string | null = null;
  if (
    validatedRequiredArtifactType === ARTIFACT_TYPES.YOUTUBE.key &&
    validatedData.requiredArtifactType === ARTIFACT_TYPES.YOUTUBE.key
  ) {
    const { validateAndRegisterTeamMiraiVideo } = await import(
      "@/features/youtube/services/youtube-like-service"
    );

    const validateResult = await validateAndRegisterTeamMiraiVideo(
      validatedData.artifactLink,
    );

    if (!validateResult.success) {
      return {
        success: false as const,
        error: validateResult.error || "YouTube動画の検証に失敗しました。",
      };
    }

    if (!validateResult.isTeamMirai) {
      return {
        success: false as const,
        error:
          validateResult.error ||
          "この動画はチームみらいの動画ではありません。",
      };
    }

    validatedYouTubeVideoId = validateResult.videoId ?? null;
  }

  // ユースケースに委譲（ミッション達成コアロジック）
  const adminClient = await createAdminClient();
  const result = await achieveMission(adminClient, supabase, {
    userId: authUser.id,
    missionId: validatedMissionId,
    artifactType: validatedRequiredArtifactType,
    artifactData: validatedData,
    artifactDescription: validatedArtifactDescription,
    shapeId: formData.get("shapeId") as string | null,
    boardId: boardId || null,
  });

  if (!result.success) {
    return result;
  }

  // YouTube固有の後処理（ユースケース外）
  if (validatedYouTubeVideoId && result.artifactId) {
    const { createYouTubeLikeRecord } = await import(
      "@/features/youtube/services/youtube-like-service"
    );

    const likeResult = await createYouTubeLikeRecord(
      authUser.id,
      validatedYouTubeVideoId,
      result.artifactId,
    );

    if (!likeResult.success) {
      return {
        success: false as const,
        error: likeResult.error || "YouTubeいいね記録の保存に失敗しました。",
      };
    }
  }

  if (validatedYouTubeCommentInfo?.commentId && result.artifactId) {
    const { data: cachedComment } = await supabase
      .from("youtube_video_comments")
      .select("comment_id")
      .eq("comment_id", validatedYouTubeCommentInfo.commentId)
      .maybeSingle();

    if (cachedComment) {
      const { createYouTubeCommentRecord } = await import(
        "@/features/youtube/services/youtube-comment-service"
      );

      const commentResult = await createYouTubeCommentRecord(
        authUser.id,
        validatedYouTubeCommentInfo.videoId,
        validatedYouTubeCommentInfo.commentId,
        result.artifactId,
      );

      if (!commentResult.success) {
        console.error("YouTubeコメント記録の保存に失敗:", commentResult.error);
      }
    }
  }

  return result;
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
      success: false as const,
      error: formatZodErrors(validatedFields.error),
    };
  }

  const {
    achievementId: validatedAchievementId,
    missionId: validatedMissionId,
  } = validatedFields.data;

  const supabase = createClient();

  // ユーザーがログイン済みかチェック
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return { success: false as const, error: "認証エラーが発生しました。" };
  }

  // ユースケースに委譲
  const adminSupabase = await createAdminClient();
  return cancelSubmission(adminSupabase, supabase, {
    userId: authUser.id,
    achievementId: validatedAchievementId,
    missionId: validatedMissionId,
  });
};
