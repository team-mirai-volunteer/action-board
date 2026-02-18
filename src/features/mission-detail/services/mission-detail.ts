import { nanoid } from "nanoid";
import { cache } from "react";
import type {
  Achievement,
  MissionArtifact,
  MissionPageData,
  SubmissionData,
} from "@/features/mission-detail/types/detail-types";
import { groupMissionsByCategory } from "@/features/missions/utils/group-missions-by-category";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

const SUBMISSION_DISPLAY_LIMIT = 20;

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
  const supabase = createClient();

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
 * ミッションデータをIDまたはslugで取得する（cache()でリクエスト内重複排除）
 * @param identifier - ミッションIDまたはslug
 * @returns ミッションデータ
 */
export const getMissionData = cache(
  async (identifier: string): Promise<Tables<"missions"> | null> => {
    const supabase = createClient();

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
  },
);

/**
 * slugからミッションのIDを取得する
 * @param slug - ミッションのslug
 * @returns ミッションID、見つからない場合はnull
 */
export async function getMissionIdBySlug(slug: string): Promise<string | null> {
  const supabase = createClient();

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
  const supabase = createClient();

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
  const supabase = createClient();

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

export async function getUserAchievementCount(
  userId: string,
  missionId: string,
): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("achievements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("mission_id", missionId);

  if (error) {
    console.error("Achievement count fetch error:", error);
    return 0;
  }

  return count ?? 0;
}

export async function getUserAchievements(
  userId: string,
  missionId: string,
): Promise<{ achievements: Achievement[]; count: number }> {
  const supabase = createClient();

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

/**
 * ユーザーの達成履歴を取得する（ネストselectでN+1解消）
 * @param limit - 取得件数（省略時は全件）
 */
export async function getSubmissionHistory(
  userId: string,
  missionId: string,
  limit?: number,
): Promise<SubmissionData[]> {
  const supabase = createClient();

  // ネストselectでachievements + mission_artifactsを1クエリで取得
  let query = supabase
    .from("achievements")
    .select(
      "id, created_at, mission_id, user_id, season_id, mission_artifacts(*)",
    )
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .order("created_at", { ascending: false });

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const { data: achievementsWithArtifacts, error } = await query;

  if (error) {
    console.error("Submissions fetch error:", error);
    return [];
  }

  if (!achievementsWithArtifacts || achievementsWithArtifacts.length === 0) {
    return [];
  }

  // mission_artifactsを正規化（1対1リレーションの場合オブジェクトが返るため配列に統一）
  const normalizeArtifacts = (
    artifacts: (typeof achievementsWithArtifacts)[number]["mission_artifacts"],
  ) => {
    if (!artifacts) return [];
    return Array.isArray(artifacts) ? artifacts : [artifacts];
  };

  // 画像パスを収集してバッチで署名付きURL生成
  const allImagePaths: string[] = [];
  for (const achievement of achievementsWithArtifacts) {
    for (const artifact of normalizeArtifacts(achievement.mission_artifacts)) {
      if (artifact.image_storage_path) {
        allImagePaths.push(artifact.image_storage_path);
      }
    }
  }

  const signedUrlMap = new Map<string, string>();
  if (allImagePaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("mission_artifact_files")
      .createSignedUrls(allImagePaths, 60);

    if (signedUrls) {
      for (const item of signedUrls) {
        if (item.path && item.signedUrl) {
          signedUrlMap.set(item.path, item.signedUrl);
        }
      }
    }
  }

  // SubmissionData形式にマッピング
  return achievementsWithArtifacts
    .filter((a) => a.mission_id && a.user_id)
    .map((achievement) => ({
      id: achievement.id,
      mission_id: achievement.mission_id as string,
      user_id: achievement.user_id as string,
      season_id: achievement.season_id ?? "",
      created_at: achievement.created_at,
      artifacts: normalizeArtifacts(achievement.mission_artifacts).map(
        (artifact) => ({
          ...artifact,
          image_storage_path: artifact.image_storage_path
            ? (signedUrlMap.get(artifact.image_storage_path) ??
              artifact.image_storage_path)
            : artifact.image_storage_path,
        }),
      ) as MissionArtifact[],
    }));
}

export async function getMissionMainLink(
  missionId: string,
): Promise<Tables<"mission_main_links"> | null> {
  const supabase = createClient();

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
  const supabase = createClient();

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
  userId?: string,
): Promise<MissionPageData | null> {
  const mission = await getMissionData(identifier);

  if (!mission) return null;
  if (mission.is_hidden) return null;

  const missionUUID = mission.id;

  // 独立したクエリを並列実行
  const [
    userAchievementCountMap,
    userAchievementCount,
    submissions,
    referralCode,
    totalAchievementCount,
    mainLink,
    rawMissions,
  ] = await Promise.all([
    userId
      ? getUserMissionAchievements(userId)
      : Promise.resolve(new Map<string, number>()),
    userId ? getUserAchievementCount(userId, missionUUID) : Promise.resolve(0),
    userId
      ? getSubmissionHistory(userId, missionUUID, SUBMISSION_DISPLAY_LIMIT)
      : Promise.resolve([]),
    userId ? getReferralCode(userId) : Promise.resolve(null),
    getTotalAchievementCount(missionUUID),
    getMissionMainLink(missionUUID),
    getRelatedCategoryMissionsRaw(missionUUID),
  ]);
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
    userAchievements: [],
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
  const supabase = createClient();

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
