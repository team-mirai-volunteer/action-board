import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/supabase";
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

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      missionId,
    );

  const { data: missionData, error } = await supabase
    .from("missions")
    .select("*, required_artifact_type, max_achievement_count")
    .eq(isUUID ? "id" : "slug", missionId)
    .single();

  if (error) {
    console.error("Mission fetch error:", error);
    console.error(
      "Mission fetch error details:",
      JSON.stringify(error, null, 2),
    );
    console.error("Mission ID being queried:", missionId);
    console.error("Query type:", isUUID ? "UUID" : "slug");
    console.error("Supabase client status:", !!supabase);
    return null;
  }

  return missionData;
}

export async function getTotalAchievementCount(
  missionSlug: string,
): Promise<number> {
  const supabase = await createServerClient();

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      missionSlug,
    );

  const { data: missionData, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq(isUUID ? "id" : "slug", missionSlug)
    .single();

  if (missionError || !missionData) {
    console.error("Mission ID fetch error for count:", missionError);
    console.error("Query type:", isUUID ? "UUID" : "slug");
    console.error("Input value:", missionSlug);
    return 0;
  }

  const { data: countData, error } = await supabase
    .from("mission_achievement_count_view")
    .select("achievement_count")
    .eq("mission_id", missionData.id)
    .single();

  if (error) {
    console.error("Count fetch error:", error);
    console.error("Count fetch error details:", JSON.stringify(error, null, 2));
    console.error("Mission ID for count query:", missionData.id);
    return 0;
  }

  return countData?.achievement_count || 0;
}

export async function getUserAchievements(
  userId: string,
  missionSlug: string,
): Promise<{ achievements: Achievement[]; count: number }> {
  const supabase = await createServerClient();

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      missionSlug,
    );

  const { data: missionData, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq(isUUID ? "id" : "slug", missionSlug)
    .single();

  if (missionError || !missionData) {
    console.error("Mission ID fetch error for achievements:", missionError);
    console.error("Query type:", isUUID ? "UUID" : "slug");
    console.error("Input value:", missionSlug);
    return { achievements: [], count: 0 };
  }

  const { data: achievementsData, error } = await supabase
    .from("achievements")
    .select("id, created_at, mission_id, user_id")
    .eq("user_id", userId)
    .eq("mission_id", missionData.id)
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
  missionSlug: string,
): Promise<SubmissionData[]> {
  const supabase = await createServerClient();

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      missionSlug,
    );

  const { data: missionData, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq(isUUID ? "id" : "slug", missionSlug)
    .single();

  if (missionError || !missionData) {
    console.error(
      "Mission ID fetch error for submission history:",
      missionError,
    );
    console.error("Query type:", isUUID ? "UUID" : "slug");
    console.error("Input value:", missionSlug);
    return [];
  }

  // ユーザーの達成履歴を取得
  const { data: achievementsData, error: achievementsError } = await supabase
    .from("achievements")
    .select("id, created_at, mission_id, user_id")
    .eq("user_id", userId)
    .eq("mission_id", missionData.id)
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
    achievementsData.map(async (achievement: Achievement) => {
      const { data: artifactsData, error: artifactsError } = await supabase
        .from("mission_artifacts")
        .select("*")
        .eq("achievement_id", achievement.id);

      if (artifactsError) {
        console.error("Artifacts fetch error:", artifactsError);
        return {
          ...achievement,
          artifacts: [],
        };
      }

      // 成果物に画像がある場合は署名付きURLを取得
      const artifactsWithSignedUrls = await Promise.all(
        (artifactsData || []).map(
          async (artifact: Tables<"mission_artifacts">) => {
            if (artifact.image_storage_path) {
              const { data: signedUrlData } = await supabase.storage
                .from("mission_artifact_files")
                .createSignedUrl(artifact.image_storage_path, 60, {
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
                };
              }
            }
            return artifact;
          },
        ),
      );

      // 位置情報を取得
      const artifactsWithGeolocations = await Promise.all(
        artifactsWithSignedUrls.map(
          async (artifact: Tables<"mission_artifacts">) => {
            if (artifact.artifact_type === "IMAGE_WITH_GEOLOCATION") {
              const { data: geolocationsData, error: geolocationsError } =
                await supabase
                  .from("mission_artifact_geolocations")
                  .select("*")
                  .eq("mission_artifact_id", artifact.id);

              if (!geolocationsError && geolocationsData) {
                return {
                  ...artifact,
                  geolocations: geolocationsData,
                } as MissionArtifact;
              }
            }
            return artifact as MissionArtifact;
          },
        ),
      );

      return {
        ...achievement,
        artifacts: artifactsWithGeolocations,
      } as SubmissionData;
    }),
  );

  // null値をフィルタリングして型安全にする
  const validSubmissions = submissionsWithArtifacts.filter(
    (submission: unknown): submission is SubmissionData => {
      if (typeof submission !== "object" || submission === null) {
        return false;
      }
      const sub = submission as Record<string, unknown>;
      return (
        "mission_id" in sub &&
        "user_id" in sub &&
        sub.mission_id !== null &&
        sub.user_id !== null
      );
    },
  );

  return validSubmissions;
}

export async function getMissionMainLink(
  missionSlug: string,
): Promise<Tables<"mission_main_links"> | null> {
  const supabase = await createServerClient();

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      missionSlug,
    );

  const { data: missionData, error: missionError } = await supabase
    .from("missions")
    .select("id")
    .eq(isUUID ? "id" : "slug", missionSlug)
    .single();

  if (missionError || !missionData) {
    console.error("Mission ID fetch error for main link:", missionError);
    console.error("Query type:", isUUID ? "UUID" : "slug");
    console.error("Input value:", missionSlug);
    return null;
  }

  const { data, error } = await supabase
    .from("mission_main_links")
    .select("*")
    .eq("mission_id", missionData.id)
    .maybeSingle();

  if (error) {
    console.error("Mission main link fetch error:", error);
    return null;
  }

  return data;
}

export async function getMissionPageData(
  missionSlug: string,
  userId?: string,
): Promise<MissionPageData | null> {
  const mission = await getMissionData(missionSlug);

  if (!mission) return null;

  let userAchievements: Achievement[] = [];
  let userAchievementCount = 0;
  let submissions: SubmissionData[] = [];
  let referralCode: string | null = null;

  if (userId) {
    const { achievements, count } = await getUserAchievements(
      userId,
      missionSlug,
    );
    userAchievements = achievements;
    userAchievementCount = count;
    submissions = await getSubmissionHistory(userId, missionSlug);
    referralCode = await getReferralCode(userId);
  }

  // 総達成回数の取得
  const totalAchievementCount = await getTotalAchievementCount(missionSlug);

  // メインリンクの取得
  const mainLink = await getMissionMainLink(missionSlug);

  return {
    mission,
    userAchievements,
    submissions,
    userAchievementCount,
    totalAchievementCount,
    referralCode,
    mainLink,
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
