import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserLevel } from "@/features/user-level/types/level-types";
import {
  calculateLevel,
  calculateMissionXp,
} from "@/features/user-level/utils/level-calculator";
import {
  MAX_POSTER_COUNT,
  POSTER_POINTS_PER_UNIT,
  POSTING_POINTS_PER_UNIT,
} from "@/lib/constants/mission-config";
import { ARTIFACT_TYPES } from "@/lib/types/artifact-types";
import type { Database, TablesInsert } from "@/lib/types/supabase";
import type { AchieveMissionFormData } from "../actions/actions";
import {
  buildArtifactPayload,
  getArtifactTypeLabel,
  savePosterActivity,
  savePostingActivity,
} from "../actions/artifact-helpers";

export type AchieveMissionInput = {
  userId: string;
  missionId: string;
  artifactType: string;
  artifactData: AchieveMissionFormData;
  artifactDescription?: string;
  // POSTING specific
  shapeId?: string | null;
  // POSTER specific
  boardId?: string | null;
};

export type AchieveMissionResult =
  | {
      success: true;
      message: string;
      xpGranted: number;
      userLevel?: UserLevel | null;
      artifactId?: string;
    }
  | { success: false; error: string };

/**
 * adminSupabase を使って現在のアクティブシーズンIDを取得する。
 * サービス層の getCurrentSeasonId() は createAdminClient() に依存するため、
 * ユースケースでは渡されたクライアントを直接使う。
 */
async function fetchCurrentSeasonId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching current season:", error);
    return null;
  }
  return data?.id ?? null;
}

/**
 * XPトランザクション記録 + ユーザーレベル更新を行う。
 * サービス層の grantXp/grantMissionCompletionXp は createAdminClient() に依存するため、
 * ユースケースでは渡されたクライアントを直接使う。
 */
async function processXpGrant(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    seasonId: string;
    xpAmount: number;
    sourceType: string;
    sourceId?: string;
    description?: string;
  },
): Promise<{
  success: boolean;
  xpGranted?: number;
  userLevel?: UserLevel | null;
  error?: string;
}> {
  const { userId, seasonId, xpAmount, sourceType, sourceId, description } =
    params;

  // XPトランザクションを記録
  const { error: transactionError } = await supabase
    .from("xp_transactions")
    .insert({
      user_id: userId,
      season_id: seasonId,
      xp_amount: xpAmount,
      source_type: sourceType,
      source_id: sourceId,
      description: description || `${sourceType}による経験値調整`,
    });

  if (transactionError) {
    console.error("Failed to create XP transaction:", transactionError);
    return { success: false, error: transactionError.message };
  }

  // ユーザーレベル情報を取得（存在しない場合は初期化）
  let { data: currentLevel } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .maybeSingle();

  if (!currentLevel) {
    const { data: newLevel, error: initError } = await supabase
      .from("user_levels")
      .insert({
        user_id: userId,
        season_id: seasonId,
        xp: 0,
        level: 1,
      })
      .select()
      .single();

    if (initError || !newLevel) {
      console.error("Failed to initialize user level:", initError);
      return {
        success: false,
        error: "ユーザーレベルの初期化に失敗しました",
      };
    }
    currentLevel = newLevel;
  }

  // 新しいXPとレベルを計算
  const newXp = currentLevel.xp + xpAmount;
  const newLevel = calculateLevel(newXp);

  // ユーザーレベルを更新
  const { data: updatedLevel, error: updateError } = await supabase
    .from("user_levels")
    .update({
      xp: newXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .select()
    .single();

  if (updateError) {
    console.error("Failed to update user level:", updateError);
    return { success: false, error: "ユーザーレベルの更新に失敗しました" };
  }

  return { success: true, xpGranted: xpAmount, userLevel: updatedLevel };
}

/**
 * ボーナスXPを計算して付与する。
 * 失敗時は 0 を返す（ボーナス失敗はミッション達成の成功を妨げない）。
 */
async function grantBonusXp(
  supabase: SupabaseClient<Database>,
  seasonId: string,
  params: {
    userId: string;
    achievementId: string;
    count: number;
    pointsPerUnit: number;
    isFeatured: boolean;
    descriptionLabel: string;
  },
): Promise<number> {
  const {
    userId,
    achievementId,
    count,
    pointsPerUnit,
    isFeatured,
    descriptionLabel,
  } = params;

  const basePoints = count * pointsPerUnit;
  const totalPoints = isFeatured ? basePoints * 2 : basePoints;

  const result = await processXpGrant(supabase, {
    userId,
    seasonId,
    xpAmount: totalPoints,
    sourceType: "BONUS",
    sourceId: achievementId,
    description: `${descriptionLabel}（${count}枚=${totalPoints}ポイント${isFeatured ? "【2倍】" : ""}）`,
  });

  if (!result.success) {
    console.error(`${descriptionLabel}XP付与に失敗しました:`, result.error);
    return 0;
  }

  return totalPoints;
}

export async function achieveMission(
  adminSupabase: SupabaseClient<Database>,
  userSupabase: SupabaseClient<Database>,
  input: AchieveMissionInput,
): Promise<AchieveMissionResult> {
  const { userId, missionId, artifactType, artifactData, artifactDescription } =
    input;

  let totalXpGranted = 0;
  let createdArtifactId: string | undefined;

  // Fetch mission info
  const { data: missionData, error: missionFetchError } = await adminSupabase
    .from("missions")
    .select(
      "max_achievement_count, required_artifact_type, is_featured, difficulty, title",
    )
    .eq("id", missionId)
    .single();

  if (missionFetchError) {
    return {
      success: false,
      error: "ミッション情報の取得に失敗しました。",
    };
  }

  // Check max_achievement_count
  if (missionData?.max_achievement_count !== null) {
    const { data: userAchievements, error: userAchievementError } =
      await adminSupabase
        .from("achievements")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .eq("mission_id", missionId);

    if (userAchievementError) {
      return {
        success: false,
        error: "ユーザーの達成回数の取得に失敗しました。",
      };
    }

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

  // LINK duplicate validation
  if (
    artifactType === ARTIFACT_TYPES.LINK.key &&
    artifactData.requiredArtifactType === ARTIFACT_TYPES.LINK.key
  ) {
    const { data: duplicateArtifacts, error: duplicateError } =
      await adminSupabase
        .from("mission_artifacts")
        .select(`
				id,
				achievements!inner(mission_id)
			`)
        .eq("user_id", userId)
        .eq("artifact_type", ARTIFACT_TYPES.LINK.key)
        .eq("link_url", artifactData.artifactLink)
        .eq("achievements.mission_id", missionId);

    if (duplicateError) {
      return {
        success: false,
        error: "重複チェック中にエラーが発生しました。",
      };
    }

    if (duplicateArtifacts && duplicateArtifacts.length > 0) {
      return {
        success: false,
        error: "記録に失敗しました。同じURLがすでに登録されています。",
      };
    }
  }

  // Get current season using adminSupabase
  const currentSeasonId = await fetchCurrentSeasonId(adminSupabase);
  if (!currentSeasonId) {
    return {
      success: false,
      error: "Current season not found",
    };
  }

  // Create achievement
  const achievementPayload = {
    user_id: userId,
    mission_id: missionId,
    season_id: currentSeasonId,
  };

  const { data: achievement, error: achievementError } = await adminSupabase
    .from("achievements")
    .insert(achievementPayload)
    .select("id")
    .single();

  if (achievementError || !achievement) {
    return {
      success: false,
      error: `ミッション達成の記録に失敗しました: ${achievementError?.message ?? "unknown"}`,
    };
  }

  // Save artifact if needed
  if (
    artifactType &&
    artifactType !== ARTIFACT_TYPES.NONE.key &&
    artifactType !== ARTIFACT_TYPES.LINK_ACCESS.key
  ) {
    const artifactFields = buildArtifactPayload(artifactType, artifactData);
    const artifactTypeLabel = getArtifactTypeLabel(artifactType);

    const artifactPayload: TablesInsert<"mission_artifacts"> = {
      achievement_id: achievement.id,
      user_id: userId,
      artifact_type: artifactType,
      description: artifactDescription || null,
      ...artifactFields,
    };

    // CHECK constraint: except QUIZ, at least one of link_url, text_content, image_storage_path is required
    if (
      artifactType !== ARTIFACT_TYPES.QUIZ.key &&
      !artifactPayload.link_url &&
      !artifactPayload.image_storage_path &&
      !artifactPayload.text_content
    ) {
      return {
        success: false,
        error:
          "リンク、テキスト、または画像のいずれかは必須です（CHECK制約違反防止）",
      };
    }

    const { data: newArtifact, error: artifactError } = await adminSupabase
      .from("mission_artifacts")
      .insert(artifactPayload)
      .select("id")
      .single();

    if (artifactError || !newArtifact) {
      console.error(
        `[Artifact Error] type=${artifactTypeLabel} error=${artifactError?.message}`,
      );
      return {
        success: false,
        error: `成果物の保存に失敗しました: ${artifactError?.message ?? "unknown"}`,
      };
    }

    createdArtifactId = newArtifact.id;

    // Save posting activity
    if (
      artifactType === ARTIFACT_TYPES.POSTING.key &&
      artifactData.requiredArtifactType === ARTIFACT_TYPES.POSTING.key
    ) {
      const postingResult = await savePostingActivity(adminSupabase, {
        artifactId: newArtifact.id,
        postingCount: artifactData.postingCount,
        locationText: artifactData.locationText ?? "",
        shapeId: input.shapeId || null,
      });
      if (!postingResult.success) {
        return { success: false, error: postingResult.error ?? "unknown" };
      }

      totalXpGranted += await grantBonusXp(adminSupabase, currentSeasonId, {
        userId,
        achievementId: achievement.id,
        count: artifactData.postingCount,
        pointsPerUnit: POSTING_POINTS_PER_UNIT,
        isFeatured: missionData?.is_featured ?? false,
        descriptionLabel: "ポスティング活動ボーナス",
      });
    }

    // Save poster activity
    if (
      artifactType === ARTIFACT_TYPES.POSTER.key &&
      artifactData.requiredArtifactType === ARTIFACT_TYPES.POSTER.key
    ) {
      const posterResult = await savePosterActivity(adminSupabase, {
        userId,
        artifactId: newArtifact.id,
        prefecture:
          artifactData.prefecture as Database["public"]["Enums"]["poster_prefecture_enum"],
        city: artifactData.city,
        boardNumber: artifactData.boardNumber,
        boardName: artifactData.boardName || null,
        boardNote: artifactData.boardNote || null,
        boardAddress: artifactData.boardAddress || null,
        boardLat: artifactData.boardLat
          ? Number.parseFloat(artifactData.boardLat)
          : null,
        boardLong: artifactData.boardLong
          ? Number.parseFloat(artifactData.boardLong)
          : null,
        boardId: input.boardId || null,
      });
      if (!posterResult.success) {
        return { success: false, error: posterResult.error ?? "unknown" };
      }

      totalXpGranted += await grantBonusXp(adminSupabase, currentSeasonId, {
        userId,
        achievementId: achievement.id,
        count: MAX_POSTER_COUNT,
        pointsPerUnit: POSTER_POINTS_PER_UNIT,
        isFeatured: missionData?.is_featured ?? false,
        descriptionLabel: "ポスターボーナス",
      });
    }
  }

  // Grant XP (non-POSTING missions)
  let xpResult: {
    success: boolean;
    xpGranted?: number;
    userLevel?: UserLevel | null;
    error?: string;
  };
  if (missionData?.required_artifact_type !== "POSTING") {
    // Inline grantMissionCompletionXp logic using adminSupabase
    const xpToGrant = calculateMissionXp(
      missionData.difficulty,
      missionData.is_featured,
    );
    const xpDescription = `ミッション「${missionData.title}」達成による経験値獲得`;

    xpResult = await processXpGrant(adminSupabase, {
      userId,
      seasonId: currentSeasonId,
      xpAmount: xpToGrant,
      sourceType: "MISSION_COMPLETION",
      sourceId: achievement.id,
      description: xpDescription,
    });

    if (!xpResult.success) {
      console.error("XP付与に失敗しました:", xpResult.error);
    }
    totalXpGranted += xpResult?.xpGranted ?? 0;
  } else {
    const { data: currentUserLevel } = await adminSupabase
      .from("user_levels")
      .select("*")
      .eq("user_id", userId)
      .eq("season_id", currentSeasonId)
      .single();

    xpResult = {
      success: true,
      xpGranted: 0,
      userLevel: currentUserLevel,
    };
  }

  return {
    success: true,
    message: "ミッションを達成しました！",
    xpGranted: totalXpGranted,
    userLevel: xpResult.userLevel,
    artifactId: createdArtifactId,
  };
}
