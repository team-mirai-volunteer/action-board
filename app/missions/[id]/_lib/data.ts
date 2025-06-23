import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";
import { getTodayInJST } from "@/lib/utils/utils";
import { nanoid } from "nanoid";
import type {
  Achievement,
  MissionArtifact,
  MissionPageData,
  SubmissionData,
} from "./types";

export async function getMissionData(
  missionId: string,
): Promise<Tables<"missions"> | null> {
  const supabase = await createServerClient();

  const { data: missionData, error } = await supabase
    .from("missions")
    .select(
      "*, required_artifact_type, max_achievement_count, max_daily_achievement_count",
    )
    .eq("id", missionId)
    .single();

  if (error) {
    console.error("Mission fetch error:", error);
    return null;
  }

  return missionData;
}

export async function getTotalAchievementCount(
  missionId: string,
): Promise<number> {
  const supabase = await createServerClient();

  const { data: countData, error } = await supabase
    .from("mission_achievement_count_view")
    .select("achievement_count")
    .eq("mission_id", missionId)
    .single();

  if (error) {
    console.error("Count fetch error:", error);
    return 0;
  }

  return countData?.achievement_count || 0;
}

export async function getUserAchievements(
  userId: string,
  missionId: string,
): Promise<{ achievements: Achievement[]; count: number }> {
  const supabase = await createServerClient();

  const { data: achievementsData, error } = await supabase
    .from("achievements")
    .select("id, created_at, mission_id, user_id")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Achievements fetch error:", error);
    return { achievements: [], count: 0 };
  }

  return {
    achievements: achievementsData || [],
    count: achievementsData?.length || 0,
  };
}

export async function getSubmissionHistory(
  userId: string,
  missionId: string,
): Promise<SubmissionData[]> {
  const supabase = await createServerClient();

  // 達成履歴と成果物を一度に取得
  const { data: achievementsData, error: achievementsError } = await supabase
    .from("achievements")
    .select(`
      id, 
      created_at, 
      mission_id, 
      user_id,
      mission_artifacts (
        id,
        artifact_type,
        description,
        image_storage_path,
        link_url,
        text_content,
        mission_artifact_geolocations (*)
      )
    `)
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

  // 画像の署名付きURLを並列処理で取得
  const submissionsWithArtifacts = await Promise.all(
    achievementsData.map(
      async (achievement: Record<string, unknown>): Promise<SubmissionData> => {
        if (
          !achievement.mission_artifacts ||
          (achievement.mission_artifacts as unknown[]).length === 0
        ) {
          return {
            id: achievement.id,
            created_at: achievement.created_at,
            mission_id: achievement.mission_id,
            user_id: achievement.user_id,
            artifacts: [],
          } as SubmissionData;
        }

        // 画像の署名付きURLを並列取得
        const artifactsWithSignedUrls = await Promise.all(
          (achievement.mission_artifacts as Record<string, unknown>[]).map(
            async (artifact: Record<string, unknown>) => {
              if (artifact.image_storage_path) {
                const { data: signedUrlData } = await supabase.storage
                  .from("mission_artifact_files")
                  .createSignedUrl(artifact.image_storage_path as string, 60, {
                    transform: {
                      width: 240,
                      height: 240,
                      resize: "contain",
                    },
                  });

                if (signedUrlData) {
                  return {
                    ...artifact,
                    image_storage_path: signedUrlData.signedUrl,
                    geolocations:
                      (artifact.mission_artifact_geolocations as unknown[]) ||
                      [],
                  };
                }
              }
              return {
                ...artifact,
                geolocations:
                  (artifact.mission_artifact_geolocations as unknown[]) || [],
              };
            },
          ),
        );

        return {
          id: achievement.id,
          created_at: achievement.created_at,
          mission_id: achievement.mission_id,
          user_id: achievement.user_id,
          artifacts: artifactsWithSignedUrls,
        } as SubmissionData;
      },
    ),
  );

  return submissionsWithArtifacts;
}

export async function getDailyAttemptStatus(
  userId: string,
  missionId: string,
): Promise<{
  currentAttempts: number;
  dailyLimit: number | null;
  hasReachedLimit: boolean;
}> {
  const supabase = await createServerClient();

  const { data: missionData } = await supabase
    .from("missions")
    .select("max_daily_achievement_count")
    .eq("id", missionId)
    .single();

  const dailyLimit = missionData?.max_daily_achievement_count ?? null;

  if (dailyLimit === null) {
    return {
      currentAttempts: 0,
      dailyLimit: null,
      hasReachedLimit: false,
    };
  }

  const today = getTodayInJST();

  const { data: attemptData } = await supabase
    .from("daily_mission_attempts")
    .select("attempt_count")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .eq("attempt_date", today)
    .single();

  const currentAttempts = attemptData?.attempt_count || 0;
  const hasReachedLimit = currentAttempts >= dailyLimit;

  return {
    currentAttempts,
    dailyLimit,
    hasReachedLimit,
  };
}

export async function getMissionPageData(
  missionId: string,
  userId?: string,
): Promise<MissionPageData | null> {
  // 全ての処理を並列実行
  const promises: Promise<unknown>[] = [
    getMissionData(missionId), // ミッションデータ
    getTotalAchievementCount(missionId), // 総達成回数
  ];

  if (userId) {
    promises.push(
      getUserAchievements(userId, missionId), // ユーザー達成履歴
      getSubmissionHistory(userId, missionId), // 提出履歴
      getReferralCode(userId), // リファラルコード
      getDailyAttemptStatus(userId, missionId), // 日次挑戦状態
    );
  }

  // 並列実行
  const results = await Promise.all(promises);

  // ミッションデータのチェック
  const mission = results[0] as Tables<"missions"> | null;
  if (!mission) return null;

  // 結果の割り当て
  let userAchievements: Achievement[] = [];
  let userAchievementCount = 0;
  let submissions: SubmissionData[] = [];
  let referralCode: string | null = null;
  let dailyAttemptStatus = {
    currentAttempts: 0,
    dailyLimit: null as number | null,
    hasReachedLimit: false,
  };

  const totalAchievementCount = results[1] as number;

  if (userId) {
    const { achievements, count } = results[2] as {
      achievements: Achievement[];
      count: number;
    };
    userAchievements = achievements;
    userAchievementCount = count;
    submissions = results[3] as SubmissionData[];
    referralCode = results[4] as string;
    dailyAttemptStatus = results[5] as {
      currentAttempts: number;
      dailyLimit: number | null;
      hasReachedLimit: boolean;
    };
  }

  return {
    mission,
    userAchievements,
    submissions,
    userAchievementCount,
    totalAchievementCount,
    referralCode,
    dailyAttemptStatus,
  };
}

// ログインユーザーに紐づくリファラルコードの取得
export async function getReferralCode(userId: string): Promise<string> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("user_referral")
    .select("referral_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Referral code fetch error:", error.message);
    throw new Error("紹介コードの取得に失敗しました");
  }

  // データがなければ作成
  if (data) {
    return data.referral_code;
  }

  // ユーザーに紐づく紹介コードが存在しない場合は新規作成
  const referralCode = nanoid(8); // 8桁ランダムコード

  const { data: insertData, error: insertError } = await supabase
    .from("user_referral")
    .insert({
      user_id: userId,
      referral_code: referralCode,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Referral code insert error:", insertError.message);
    throw new Error("紹介コードの作成に失敗しました");
  }
  return insertData.referral_code;
}
