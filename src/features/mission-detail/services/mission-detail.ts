import { nanoid } from "nanoid";
import type {
  Achievement,
  MissionArtifact,
  MissionPageData,
  SubmissionData,
} from "@/features/mission-detail/types/detail-types";
import { groupMissionsByCategory } from "@/features/missions/utils/group-missions-by-category";
import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

/**
 * UUIDv4の形式かどうかを検証する
 * @param value - 検証する文字列
 * @returns UUIDv4形式の場合はtrue
 */
export function isUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * ユーザーのミッション達成情報を取得し、ミッションIDごとの達成回数をMapで返す
 */
async function getUserMissionAchievements(
  userId: string,
): Promise<Map<string, number>> {
  const supabase = await createAdminClient();

  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("mission_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user achievements:", error);
    return new Map();
  }

  const achievementMap = new Map<string, number>();
  for (const achievement of achievements ?? []) {
    if (achievement.mission_id) {
      const current = achievementMap.get(achievement.mission_id) ?? 0;
      achievementMap.set(achievement.mission_id, current + 1);
    }
  }

  return achievementMap;
}

/**
 * ミッションデータをIDまたはslugで取得する
 * @param identifier - ミッションIDまたはslug
 * @returns ミッションデータ
 */
export async function getMissionData(
  identifier: string,
): Promise<Tables<"missions"> | null> {
  const supabase = await createAdminClient();

  // UUIDの場合はIDで検索、それ以外はslugで検索
  const column = isUUID(identifier) ? "id" : "slug";

  const { data: missionData, error } = await supabase
    .from("missions")
    .select("*, required_artifact_type, max_achievement_count")
    .eq(column, identifier)
    .single();

  if (error) {
    console.error("Mission fetch error:", error);
    return null;
  }

  return missionData;
}

/**
 * slugからミッションのIDを取得する
 * @param slug - ミッションのslug
 * @returns ミッションID、見つからない場合はnull
 */
export async function getMissionIdBySlug(slug: string): Promise<string | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Mission slug lookup error:", error);
    return null;
  }

  return data?.id ?? null;
}

/**
 * UUIDからミッションのslugを取得する
 * @param id - ミッションID（UUID）
 * @returns ミッションslug、見つからない場合はnull
 */
export async function getMissionSlugById(id: string): Promise<string | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("missions")
    .select("slug")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Mission ID lookup error:", error);
    return null;
  }

  return data?.slug ?? null;
}

export async function getTotalAchievementCount(
  missionId: string,
): Promise<number> {
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

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
  const supabase = await createAdminClient();

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
                .createSignedUrl(artifact.image_storage_path, 60);

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

      return {
        ...achievement,
        artifacts: artifactsWithSignedUrls as MissionArtifact[],
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
  missionId: string,
): Promise<Tables<"mission_main_links"> | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("mission_main_links")
    .select("*")
    .eq("mission_id", missionId)
    .maybeSingle();

  if (error) {
    console.error("Mission main link fetch error:", error);
    return null;
  }

  return data;
}

/**
 * 対象ミッションが属する全カテゴリのミッションを取得
 * @param missionId - 対象ミッションID
 * @returns フラットなミッションデータ（現在のミッションは除外）
 */
async function getRelatedCategoryMissionsRaw(
  missionId: string,
): Promise<Tables<"mission_category_view">[]> {
  const supabase = await createAdminClient();

  // カテゴリIDを取得
  const { data: links, error: linksError } = await supabase
    .from("mission_category_link")
    .select("category_id")
    .eq("mission_id", missionId)
    .eq("del_flg", false)
    .order("sort_no", { ascending: true });

  if (linksError) {
    console.error("Mission category link fetch error:", linksError);
    return [];
  }

  if (!links || links.length === 0) {
    return [];
  }

  const categoryIds = links.map((link) => link.category_id);

  // 全カテゴリのミッションを取得
  const { data, error } = await supabase
    .from("mission_category_view")
    .select("*")
    .in("category_id", categoryIds)
    .neq("mission_id", missionId);

  if (error) {
    console.error("Category missions fetch error:", error);
    return [];
  }

  return data || [];
}

/**
 * @param identifier - ミッションIDまたはslug
 */
export async function getMissionPageData(
  identifier: string,
): Promise<MissionPageData | null> {
  // セッションからユーザーIDを取得（未認証の場合はnull）
  const supabaseAuth = createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();
  const userId = user?.id;

  const mission = await getMissionData(identifier);

  if (!mission) return null;
  if (mission.is_hidden) return null;

  // missionIdパラメータはslugの場合があるため、以降のクエリではmission.id（UUID）を使用
  const missionUUID = mission.id;

  let userAchievements: Achievement[] = [];
  let userAchievementCount = 0;
  let submissions: SubmissionData[] = [];
  let referralCode: string | null = null;

  // ユーザーの各ミッションに対する達成回数のマップ
  const userAchievementCountMap = userId
    ? await getUserMissionAchievements(userId)
    : new Map<string, number>();

  if (userId) {
    const { achievements, count } = await getUserAchievements(
      userId,
      missionUUID,
    );
    userAchievements = achievements;
    userAchievementCount = count;
    submissions = await getSubmissionHistory(userId, missionUUID);
    referralCode = await getReferralCode(userId);
  }

  // 総達成回数の取得
  const totalAchievementCount = await getTotalAchievementCount(missionUUID);

  // メインリンクの取得
  const mainLink = await getMissionMainLink(missionUUID);

  // 全カテゴリのミッションを取得し、グループ化・ソート・変換
  const rawMissions = await getRelatedCategoryMissionsRaw(missionUUID);
  const allCategoryMissions = groupMissionsByCategory(
    rawMissions,
    userAchievementCountMap,
    {
      showAchievedMissions: true,
      achievedMissionIds: Array.from(userAchievementCountMap.keys()),
    },
  );

  return {
    mission,
    userAchievements,
    submissions,
    userAchievementCount,
    userAchievementCountMap,
    totalAchievementCount,
    referralCode,
    mainLink,
    allCategoryMissions,
  };
}

// ログインユーザーに紐づくリファラルコードの取得
export async function getReferralCode(userId: string): Promise<string> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("user_referral")
    .select("referral_code")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Referral code fetch error:", error.message);
    throw new Error("紹介コードの取得に失敗しました");
  }

  // データがあればそのまま返す
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
    // 並行リクエストで既に作成済みの場合は再取得して返す
    if (insertError.code === "23505") {
      const { data: existingData } = await supabase
        .from("user_referral")
        .select("referral_code")
        .eq("user_id", userId)
        .single();
      if (existingData) return existingData.referral_code;
    }
    console.error("Referral code insert error:", insertError.message);
    throw new Error("紹介コードの作成に失敗しました");
  }
  return insertData.referral_code;
}
