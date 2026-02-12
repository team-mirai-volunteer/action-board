import type { SupabaseClient } from "@supabase/supabase-js";
import { isBonusMission } from "@/features/mission-detail/utils/mission-xp-utils";
import { getUserXpBonus, grantXp } from "@/features/user-level/services/level";
import type { UserLevel } from "@/features/user-level/types/level-types";
import { calculateMissionXp } from "@/features/user-level/utils/level-calculator";
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

export async function cancelSubmission(
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

  // Fetch mission info for XP calculation
  const { data: missionData, error: missionFetchError } = await userSupabase
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
    ? await getUserXpBonus(userId, achievementId)
    : 0;
  const totalXpToRevoke = xpToRevoke + bonusXp;

  const xpResult = await grantXp(
    userId,
    -totalXpToRevoke,
    "MISSION_CANCELLATION",
    achievementId,
    `ミッション「${missionData.title}」の提出取り消しによる経験値減算`,
  );

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
