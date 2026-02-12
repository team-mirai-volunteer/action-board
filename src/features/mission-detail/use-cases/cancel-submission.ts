import type { SupabaseClient } from "@supabase/supabase-js";
import { isBonusMission } from "@/features/mission-detail/utils/mission-xp-utils";
import type { UserLevel } from "@/features/user-level/types/level-types";
import {
  calculateLevel,
  calculateMissionXp,
} from "@/features/user-level/utils/level-calculator";
import type { Database } from "@/lib/types/supabase";

export type CancelSubmissionInput = {
  userId: string;
  achievementId: string;
  missionId: string;
};

export type CancelSubmissionResult =
  | {
      success: true;
      message: string;
      xpRevoked: number;
      userLevel?: UserLevel | null;
    }
  | { success: false; error: string };

/**
 * ボーナスXPの取得。
 * サービス層の getUserXpBonus() は createAdminClient() に依存するため、
 * ユースケースでは渡されたクライアントを直接使う。
 */
async function fetchUserXpBonus(
  supabase: SupabaseClient<Database>,
  userId: string,
  achievementId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("xp_transactions")
    .select("xp_amount")
    .eq("user_id", userId)
    .eq("source_id", achievementId)
    .eq("source_type", "BONUS")
    .single();

  if (error) {
    console.error("Failed to fetch BONUS XP:", error);
    return 0;
  }

  return data.xp_amount || 0;
}

/**
 * XPトランザクション記録 + ユーザーレベル更新を行う。
 */
async function processXpRevoke(
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

  // ユーザーレベル情報を取得
  const { data: currentLevel } = await supabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .maybeSingle();

  if (!currentLevel) {
    return {
      success: false,
      error: "ユーザーレベル情報の取得に失敗しました",
    };
  }

  // 新しいXPとレベルを計算
  const newXp = Math.max(0, currentLevel.xp + xpAmount);
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

  return { success: true, userLevel: updatedLevel };
}

export async function cancelSubmission(
  adminSupabase: SupabaseClient<Database>,
  userSupabase: SupabaseClient<Database>,
  input: CancelSubmissionInput,
): Promise<CancelSubmissionResult> {
  const { userId, achievementId, missionId } = input;

  // Verify achievement belongs to user
  const { data: achievement, error: achievementFetchError } = await userSupabase
    .from("achievements")
    .select("id, user_id, mission_id, season_id")
    .eq("id", achievementId)
    .eq("user_id", userId)
    .single();

  if (achievementFetchError || !achievement) {
    return {
      success: false,
      error: "達成記録が見つからないか、アクセス権限がありません。",
    };
  }

  if (!achievement.mission_id) {
    return {
      success: false,
      error: "ミッションIDが見つかりません。",
    };
  }

  if (!achievement.season_id) {
    return {
      success: false,
      error: "シーズンIDが見つかりません。",
    };
  }

  // Fetch mission info for XP calculation
  const { data: missionData, error: missionFetchError } = await adminSupabase
    .from("missions")
    .select("difficulty, title, slug, is_featured")
    .eq("id", achievement.mission_id)
    .single();

  if (missionFetchError || !missionData) {
    return {
      success: false,
      error: "ミッション情報の取得に失敗しました。",
    };
  }

  // Delete achievement (CASCADE deletes related mission_artifacts)
  const { error: deleteError } = await userSupabase
    .from("achievements")
    .delete()
    .eq("id", achievementId);

  if (deleteError) {
    return {
      success: false,
      error: `達成の取り消しに失敗しました: ${deleteError.message}`,
    };
  }

  // Revoke XP
  const xpToRevoke = calculateMissionXp(
    missionData.difficulty,
    missionData.is_featured,
  );
  const bonusXp = isBonusMission(missionData.slug)
    ? await fetchUserXpBonus(adminSupabase, userId, achievementId)
    : 0;
  const totalXpToRevoke = xpToRevoke + bonusXp;

  const xpResult = await processXpRevoke(adminSupabase, {
    userId,
    seasonId: achievement.season_id,
    xpAmount: -totalXpToRevoke,
    sourceType: "MISSION_CANCELLATION",
    sourceId: achievementId,
    description: `ミッション「${missionData.title}」の提出取り消しによる経験値減算`,
  });

  if (!xpResult.success) {
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
}
