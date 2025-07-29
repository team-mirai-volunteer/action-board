import { createClient } from "@/lib/supabase/server";
import type { SubmissionData } from "@/lib/types/domain";
import type { Tables } from "@/lib/types/supabase";

export interface MissionPageData {
  mission: Tables<"missions">;
  submissions: SubmissionData[];
  userAchievementCount: number;
  totalAchievementCount: number;
  mainLink: Tables<"mission_main_links"> | null;
  referralCode: string | null;
}

export async function getMissionPageData(
  missionId: string,
  userId?: string,
): Promise<MissionPageData | null> {
  const supabase = await createClient();

  try {
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .single();

    if (missionError || !mission) {
      console.error("Mission fetch error:", missionError);
      return null;
    }

    const [
      userAchievementsResult,
      totalAchievementResult,
      submissionHistoryResult,
      mainLinkResult,
      referralCodeResult,
    ] = await Promise.all([
      getUserAchievements(missionId, userId),
      getTotalAchievementCount(missionId),
      getSubmissionHistory(missionId, userId),
      getMainLink(missionId),
      getReferralCode(userId),
    ]);

    return {
      mission,
      submissions: submissionHistoryResult || [],
      userAchievementCount: userAchievementsResult?.length || 0,
      totalAchievementCount: totalAchievementResult || 0,
      mainLink: mainLinkResult,
      referralCode: referralCodeResult,
    };
  } catch (error) {
    console.error("Mission page data fetch error:", error);
    return null;
  }
}

export async function getMissionData(missionId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .single();

    if (error) {
      console.error("Mission data fetch error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Mission data error:", error);
    return null;
  }
}

export async function getUserAchievements(missionId: string, userId?: string) {
  if (!userId) return [];

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("mission_id", missionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("User achievements fetch error:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("User achievements error:", error);
    return [];
  }
}

export async function getTotalAchievementCount(missionId: string) {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("achievements")
      .select("*", { count: "exact", head: true })
      .eq("mission_id", missionId);

    if (error) {
      console.error("Total achievement count fetch error:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Total achievement count error:", error);
    return 0;
  }
}

export async function getSubmissionHistory(
  missionId: string,
  userId?: string,
): Promise<SubmissionData[]> {
  if (!userId) return [];

  const supabase = await createClient();

  try {
    // ユーザーの達成履歴を取得
    const { data: achievementsData, error: achievementsError } = await supabase
      .from("achievements")
      .select("id, created_at, mission_id, user_id")
      .eq("user_id", userId)
      .eq("mission_id", missionId)
      .order("created_at", { ascending: false });

    if (achievementsError) {
      console.error("Achievements fetch error:", achievementsError);
      return [];
    }

    if (!achievementsData || achievementsData.length === 0) {
      return [];
    }

    // 各達成に対応する成果物を取得
    const submissionsWithArtifacts = await Promise.all(
      achievementsData.map(async (achievement) => {
        const { data: artifactsData, error: artifactsError } = await supabase
          .from("mission_artifacts")
          .select("*")
          .eq("achievement_id", achievement.id);

        if (artifactsError) {
          console.error("Artifacts fetch error:", artifactsError);
          return {
            ...achievement,
            artifact: null,
          };
        }

        return {
          ...achievement,
          artifact:
            artifactsData && artifactsData.length > 0 ? artifactsData[0] : null,
        } as SubmissionData;
      }),
    );

    return submissionsWithArtifacts;
  } catch (error) {
    console.error("Submission history error:", error);
    return [];
  }
}

export async function getMainLink(missionId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("mission_main_links")
      .select("*")
      .eq("mission_id", missionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Main link fetch error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Main link error:", error);
    return null;
  }
}

export async function getReferralCode(userId?: string) {
  if (!userId) return null;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_referral")
      .select("referral_code")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Referral code fetch error:", error);
      return null;
    }

    return data?.referral_code || null;
  } catch (error) {
    console.error("Referral code error:", error);
    return null;
  }
}

export async function getUserAchievementCount(
  missionId: string,
  userId?: string,
) {
  if (!userId) return 0;

  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from("achievements")
      .select("*", { count: "exact", head: true })
      .eq("mission_id", missionId)
      .eq("user_id", userId);

    if (error) {
      console.error("User achievement count fetch error:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("User achievement count error:", error);
    return 0;
  }
}
