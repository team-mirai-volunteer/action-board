import "server-only";

import type { RankingPeriod } from "@/components/ranking/period-toggle";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";
import { getCurrentSeasonId } from "./seasons";

export async function getPrefecturesRanking(
  prefecture: string,
  limit = 10,
  period: RankingPeriod = "all",
  seasonId?: string,
): Promise<UserRanking[]> {
  try {
    const supabase = await createClient();

    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return [];
    }

    // 期間に応じた日付フィルタを設定
    let dateFilter: Date | null = null;

    switch (period) {
      case "daily":
        // 日本時間の今日の0時0分を基準にする
        dateFilter = getJSTMidnightToday();
        break;
      default:
        dateFilter = null;
    }

    // シーズン対応の都道府県別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_period_prefecture_ranking",
      {
        p_prefecture: prefecture,
        p_limit: limit,
        p_start_date: dateFilter?.toISOString() || undefined,
        p_season_id: targetSeasonId,
      },
    );

    if (rankingsError) {
      console.error("Failed to fetch prefecture rankings:", rankingsError);
      throw new Error(
        `都道府県ランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || rankings.length === 0) {
      return [];
    }

    // ランキングデータを変換（period_prefecture_rankingの結果形式）
    return rankings.map(
      (ranking: Record<string, unknown>) =>
        ({
          user_id: ranking.user_id,
          name: ranking.name,
          address_prefecture: prefecture,
          rank: ranking.rank,
          level: ranking.level,
          xp: ranking.xp,
          updated_at: ranking.updated_at,
        }) as UserRanking,
    );
  } catch (error) {
    console.error("Prefecture ranking service error:", error);
    throw error;
  }
}

export async function getUserPrefecturesRanking(
  prefecture: string,
  userId: string,
  seasonId?: string,
  period: RankingPeriod = "all",
): Promise<UserRanking | null> {
  try {
    const supabase = await createClient();

    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return null;
    }

    // 期間に応じた日付フィルタを設定
    let dateFilter: Date | null = null;

    switch (period) {
      case "daily":
        // 日本時間の今日の0時0分を基準にする
        dateFilter = getJSTMidnightToday();
        break;
      default:
        dateFilter = null;
    }

    // シーズン対応の特定ユーザーの都道府県別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_user_period_prefecture_ranking",
      {
        p_prefecture: prefecture,
        p_user_id: userId,
        p_start_date: dateFilter?.toISOString() || undefined,
        p_season_id: targetSeasonId,
      },
    );

    if (rankingsError) {
      console.error("Failed to fetch user prefecture ranking:", rankingsError);
      throw new Error(
        `ユーザーの都道府県ランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || rankings.length === 0) {
      return null;
    }

    const ranking = rankings[0] as Record<string, unknown>;

    return {
      user_id: ranking.user_id,
      name: ranking.name,
      address_prefecture: ranking.address_prefecture,
      rank: ranking.rank,
      level: ranking.level,
      xp: ranking.xp,
      updated_at: ranking.updated_at,
    } as UserRanking;
  } catch (error) {
    console.error("User prefecture ranking service error:", error);
    throw error;
  }
}
