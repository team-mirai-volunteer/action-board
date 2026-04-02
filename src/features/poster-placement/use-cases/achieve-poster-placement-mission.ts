import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateLevel,
  calculateMissionXp,
} from "@/features/user-level/utils/level-calculator";
import type { Database } from "@/lib/types/supabase";

/** ポスター掲示ミッションの slug */
const POSTER_PLACEMENT_MISSION_SLUG = "poster-placement";

export type AchievePosterPlacementResult =
  | {
      success: true;
      artifactId: string;
      xpGranted: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * ポスター掲示報告時にミッション達成（achievement + mission_artifact 作成 + XP 付与）を行う。
 *
 * 処理フロー:
 * 1. missions テーブルから slug でミッションを検索
 * 2. seasons テーブルから現在のアクティブシーズンを取得
 * 3. achievements テーブルにレコードを作成
 * 4. mission_artifacts テーブルにレコードを作成（text_content にサマリー）
 * 5. xp_transactions に XP トランザクションを記録
 * 6. user_levels を更新（XP 加算 + レベル再計算）
 *
 * @param adminSupabase - createAdminClient() で取得した SupabaseClient（service_role で RLS バイパス）
 * @param params.userId - 報告者のユーザー ID
 * @param params.prefecture - 都道府県（逆ジオコーディング結果。null 可）
 * @param params.city - 市区町村（逆ジオコーディング結果。null 可）
 * @param params.count - 掲示枚数
 * @returns { success: true, artifactId, xpGranted } または { success: false, error }
 */
export async function achievePosterPlacementMission(
  adminSupabase: SupabaseClient<Database>,
  params: {
    userId: string;
    prefecture: string | null;
    city: string | null;
    count: number;
  },
): Promise<AchievePosterPlacementResult> {
  const { userId, prefecture, city, count } = params;

  // 1. ミッションを slug で検索
  const { data: mission, error: missionError } = await adminSupabase
    .from("missions")
    .select("id, difficulty, is_featured, title")
    .eq("slug", POSTER_PLACEMENT_MISSION_SLUG)
    .single();

  if (missionError || !mission) {
    console.error("Poster placement mission not found:", missionError);
    return {
      success: false,
      error: "ポスター掲示ミッションが見つかりません",
    };
  }

  // 2. 現在のアクティブシーズンを取得
  const { data: season, error: seasonError } = await adminSupabase
    .from("seasons")
    .select("id")
    .eq("is_active", true)
    .single();

  if (seasonError || !season) {
    console.error("Active season not found:", seasonError);
    return {
      success: false,
      error: "アクティブなシーズンが見つかりません",
    };
  }

  // 3. achievement を作成
  const { data: achievement, error: achievementError } = await adminSupabase
    .from("achievements")
    .insert({
      user_id: userId,
      mission_id: mission.id,
      season_id: season.id,
    })
    .select("id")
    .single();

  if (achievementError || !achievement) {
    console.error("Failed to create achievement:", achievementError);
    return {
      success: false,
      error: `ミッション達成の記録に失敗しました: ${achievementError?.message ?? "unknown"}`,
    };
  }

  // 4. mission_artifact を作成
  // text_content にサマリーテキストを格納（POSTING ミッションと同じパターン）
  const locationText = prefecture && city ? `${prefecture}${city}` : "住所不明";
  const textContent = `ポスター掲示: ${locationText} ${count}枚`;

  const { data: artifact, error: artifactError } = await adminSupabase
    .from("mission_artifacts")
    .insert({
      achievement_id: achievement.id,
      user_id: userId,
      artifact_type: "TEXT",
      text_content: textContent,
      description: `ポスター掲示報告（${locationText}、${count}枚）`,
    })
    .select("id")
    .single();

  if (artifactError || !artifact) {
    console.error("Failed to create mission artifact:", artifactError);
    return {
      success: false,
      error: `成果物の保存に失敗しました: ${artifactError?.message ?? "unknown"}`,
    };
  }

  // 5. XP を付与
  const xpToGrant = calculateMissionXp(mission.difficulty, mission.is_featured);
  const xpDescription = `ミッション「${mission.title}」達成による経験値獲得`;

  const { error: xpTransactionError } = await adminSupabase
    .from("xp_transactions")
    .insert({
      user_id: userId,
      season_id: season.id,
      xp_amount: xpToGrant,
      source_type: "MISSION_COMPLETION",
      source_id: achievement.id,
      description: xpDescription,
    });

  if (xpTransactionError) {
    console.error("Failed to create XP transaction:", xpTransactionError);
    // XP 付与失敗はミッション達成自体の失敗にはしない（achievement は作成済み）
  }

  // 6. user_levels を更新
  let { data: currentLevel } = await adminSupabase
    .from("user_levels")
    .select("*")
    .eq("user_id", userId)
    .eq("season_id", season.id)
    .maybeSingle();

  if (!currentLevel) {
    const { data: newLevel, error: initError } = await adminSupabase
      .from("user_levels")
      .insert({
        user_id: userId,
        season_id: season.id,
        xp: 0,
        level: 1,
      })
      .select()
      .single();

    if (initError || !newLevel) {
      console.error("Failed to initialize user level:", initError);
    } else {
      currentLevel = newLevel;
    }
  }

  if (currentLevel) {
    const newXp = currentLevel.xp + xpToGrant;
    const newLevel = calculateLevel(newXp);

    await adminSupabase
      .from("user_levels")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("season_id", season.id);
  }

  return {
    success: true,
    artifactId: artifact.id,
    xpGranted: xpToGrant,
  };
}
