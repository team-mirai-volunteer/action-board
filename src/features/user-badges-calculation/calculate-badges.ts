import { PREFECTURES } from "@/lib/constants/prefectures";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { getCurrentSeasonId } from "../../lib/services/seasons";
import { createAdminClient } from "../../lib/supabase/adminClient";
import type { BadgeUpdateParams } from "../user-badges/badge-types";

/**
 * 全てのバッジを計算・更新
 */
export async function calculateAllBadges(seasonId?: string): Promise<{
  success: boolean;
  results: {
    all: { success: boolean; updatedCount: number };
    daily: { success: boolean; updatedCount: number };
    prefecture: { success: boolean; updatedCount: number };
    mission: { success: boolean; updatedCount: number };
  };
}> {
  console.log("Starting badge calculation...");

  const [allResult, dailyResult, prefectureResult, missionResult] =
    await Promise.all([
      calculateAllRankingBadges(seasonId),
      calculateDailyRankingBadges(seasonId),
      calculatePrefectureRankingBadges(seasonId),
      calculateMissionRankingBadges(seasonId),
    ]);

  const results = {
    all: allResult,
    daily: dailyResult,
    prefecture: prefectureResult,
    mission: missionResult,
  };

  const totalUpdated =
    allResult.updatedCount +
    dailyResult.updatedCount +
    prefectureResult.updatedCount +
    missionResult.updatedCount;

  console.log(
    `Badge calculation completed. Total badges updated: ${totalUpdated}`,
  );

  return {
    success:
      allResult.success &&
      dailyResult.success &&
      prefectureResult.success &&
      missionResult.success,
    results,
  };
}

/**
 * 全体ランキングのバッジを計算・更新
 */
async function calculateAllRankingBadges(seasonId?: string): Promise<{
  success: boolean;
  updatedCount: number;
}> {
  const supabaseAdmin = await createAdminClient();
  let updatedCount = 0;

  try {
    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return { success: false, updatedCount: 0 };
    }

    // TOP100のユーザーを取得
    const { data: allRanking, error } = await supabaseAdmin.rpc(
      "get_period_ranking",
      {
        p_limit: 100,
        p_season_id: targetSeasonId,
      },
    );

    if (error) {
      console.error("Error fetching all ranking:", error);
      return { success: false, updatedCount: 0 };
    }

    // 各ユーザーのバッジを更新
    for (const user of allRanking || []) {
      const result = await updateBadge({
        user_id: user.user_id,
        badge_type: "ALL",
        sub_type: null,
        rank: user.rank,
        season_id: targetSeasonId,
      });

      if (result.updated) {
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error in calculateAllRankingBadges:", error);
    return { success: false, updatedCount };
  }
}

/**
 * デイリーランキングのバッジを計算・更新
 * 深夜に実行されるため、前日のランキングを計算する
 */
async function calculateDailyRankingBadges(seasonId?: string): Promise<{
  success: boolean;
  updatedCount: number;
}> {
  const supabaseAdmin = await createAdminClient();
  let updatedCount = 0;

  try {
    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return { success: false, updatedCount: 0 };
    }

    // 日本時間（JST）で前日の0時と当日の0時を取得
    const todayJST = getJSTMidnightToday();

    // 日本時間の昨日の0時を取得
    const yesterdayJST = new Date(todayJST);
    yesterdayJST.setUTCDate(yesterdayJST.getUTCDate() - 1);

    console.log(
      `Calculating daily ranking for JST date: ${yesterdayJST.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }).split(" ")[0]}`,
    );
    console.log(
      `Period: ${yesterdayJST.toISOString()} to ${todayJST.toISOString()}`,
    );

    // 前日のデイリーランキングTOP100を取得
    const { data: dailyRanking, error } = await supabaseAdmin.rpc(
      "get_period_ranking",
      {
        p_limit: 100,
        p_start_date: yesterdayJST.toISOString(),
        p_end_date: todayJST.toISOString(),
        p_season_id: targetSeasonId,
      },
    );

    if (error) {
      console.error("Error fetching daily ranking:", error);
      return { success: false, updatedCount: 0 };
    }

    // 各ユーザーのバッジを更新
    for (const user of dailyRanking || []) {
      const result = await updateBadge({
        user_id: user.user_id,
        badge_type: "DAILY",
        sub_type: null,
        rank: user.rank,
        season_id: targetSeasonId,
      });

      if (result.updated) {
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error in calculateDailyRankingBadges:", error);
    return { success: false, updatedCount };
  }
}

/**
 * 都道府県別ランキングのバッジを計算・更新
 */
async function calculatePrefectureRankingBadges(seasonId?: string): Promise<{
  success: boolean;
  updatedCount: number;
}> {
  const supabase = await createAdminClient();
  let updatedCount = 0;

  try {
    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return { success: false, updatedCount: 0 };
    }

    // 各都道府県ごとに処理
    for (const prefecture of PREFECTURES) {
      const { data: prefectureRanking, error } = await supabase.rpc(
        "get_period_prefecture_ranking",
        {
          p_prefecture: prefecture,
          p_limit: 100,
          p_season_id: targetSeasonId,
        },
      );

      if (error) {
        console.error(`Error fetching ranking for ${prefecture}:`, error);
        continue;
      }

      // 各ユーザーのバッジを更新
      for (const user of prefectureRanking || []) {
        const result = await updateBadge({
          user_id: user.user_id,
          badge_type: "PREFECTURE",
          sub_type: prefecture,
          rank: user.rank,
          season_id: targetSeasonId,
        });

        if (result.updated) {
          updatedCount++;
        }
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error in calculatePrefectureRankingBadges:", error);
    return { success: false, updatedCount };
  }
}

/**
 * ミッション別ランキングのバッジを計算・更新
 */
async function calculateMissionRankingBadges(seasonId?: string): Promise<{
  success: boolean;
  updatedCount: number;
}> {
  const supabaseAdmin = await createAdminClient();
  let updatedCount = 0;

  try {
    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return { success: false, updatedCount: 0 };
    }

    // max_achievement_countがnullのミッションを取得
    const { data: missions, error: missionsError } = await supabaseAdmin
      .from("missions")
      .select("id, slug")
      .is("max_achievement_count", null)
      .eq("is_hidden", false);

    if (missionsError) {
      console.error("Error fetching missions:", missionsError);
      return { success: false, updatedCount: 0 };
    }

    // 各ミッションごとに処理
    for (const mission of missions || []) {
      const { data: missionRanking, error } = await supabaseAdmin.rpc(
        "get_period_mission_ranking",
        {
          p_mission_id: mission.id,
          p_limit: 100,
          p_season_id: targetSeasonId,
        },
      );

      if (error) {
        console.error(
          `Error fetching ranking for mission ${mission.slug}:`,
          error,
        );
        continue;
      }

      // 各ユーザーのバッジを更新
      for (const user of missionRanking || []) {
        const result = await updateBadge({
          user_id: user.user_id,
          badge_type: "MISSION",
          sub_type: mission.slug,
          rank: user.rank,
          season_id: targetSeasonId,
        });

        if (result.updated) {
          updatedCount++;
        }
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Error in calculateMissionRankingBadges:", error);
    return { success: false, updatedCount };
  }
}

/**
 * バッジを更新する（順位が改善された場合のみ）
 */
async function updateBadge({
  user_id,
  badge_type,
  sub_type,
  rank,
  season_id,
}: BadgeUpdateParams & { season_id: string }): Promise<{
  success: boolean;
  updated: boolean;
}> {
  const supabaseAdmin = await createAdminClient();

  try {
    // 既存バッジを確認（シーズンとタイプで検索）
    const query = supabaseAdmin
      .from("user_badges")
      .select("*")
      .eq("user_id", user_id)
      .eq("badge_type", badge_type)
      .eq("season_id", season_id);

    // sub_typeがnullの場合とそうでない場合で処理を分ける
    if (sub_type === null) {
      query.is("sub_type", null);
    } else {
      query.eq("sub_type", sub_type);
    }

    const { data: existing, error: fetchError } = await query.single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching existing badge:", fetchError);
      return { success: false, updated: false };
    }

    if (!existing) {
      // 新規作成
      const { error: insertError } = await supabaseAdmin
        .from("user_badges")
        .insert({
          user_id,
          badge_type,
          sub_type,
          rank,
          season_id,
          achieved_at: new Date().toISOString(),
          is_notified: false,
        });

      if (insertError) {
        console.error("Error inserting new badge:", insertError);
        return { success: false, updated: false };
      }

      return { success: true, updated: true };
    }

    if (rank < existing.rank) {
      // 順位が改善された場合のみ更新
      const { error: updateError } = await supabaseAdmin
        .from("user_badges")
        .update({
          rank,
          achieved_at: new Date().toISOString(),
          is_notified: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating badge:", updateError);
        return { success: false, updated: false };
      }

      return { success: true, updated: true };
    }

    // 順位が改善されていない場合
    return { success: true, updated: false };
  } catch (error) {
    console.error("Unexpected error in updateBadge:", error);
    return { success: false, updated: false };
  }
}
