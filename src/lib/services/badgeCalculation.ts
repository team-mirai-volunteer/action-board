"server-only";

import { PREFECTURES } from "@/lib/address";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { createAdminClient } from "../supabase/adminClient";
import { updateBadge } from "./badges";
import { getCurrentSeasonId } from "./seasons";

/**
 * 全体ランキングのバッジを計算・更新
 */
export async function calculateAllRankingBadges(seasonId?: string): Promise<{
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
export async function calculateDailyRankingBadges(seasonId?: string): Promise<{
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
export async function calculatePrefectureRankingBadges(
  seasonId?: string,
): Promise<{
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
export async function calculateMissionRankingBadges(
  seasonId?: string,
): Promise<{
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
