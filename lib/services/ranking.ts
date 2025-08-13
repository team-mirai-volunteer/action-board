import "server-only";

import type { RankingPeriod } from "@/components/ranking/period-toggle";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSeasonId } from "./seasons";

export interface UserRanking {
  user_id: string | null;
  address_prefecture: string | null;
  level: number | null;
  name: string | null;
  rank: number | null;
  updated_at: string | null;
  xp: number | null;
}

export async function getRanking(
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

    // 指定されたシーズンのRPC関数を使用
    const { data: periodRankingData, error: rpcError } = await supabase.rpc(
      "get_period_ranking",
      {
        p_start_date: dateFilter?.toISOString() || undefined,
        p_limit: limit,
        p_end_date: undefined,
        p_season_id: targetSeasonId, // 指定されたシーズンIDを使用
      },
    );

    if (rpcError) {
      console.log(rpcError);
      throw new Error(
        `シーズンランキングの取得に失敗しました: ${rpcError.message}`,
      );
    }

    return periodRankingData || [];
  } catch (error) {
    console.error("Ranking service error:", error);
    throw error;
  }
}
