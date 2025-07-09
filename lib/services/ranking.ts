import "server-only";

import type { RankingPeriod } from "@/components/ranking/period-toggle";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";

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
): Promise<UserRanking[]> {
  try {
    const supabase = await createClient();

    // 期間に応じた日付フィルタを設定
    let dateFilter: Date | null = null;
    const now = new Date();

    switch (period) {
      case "daily":
        dateFilter = getJSTMidnightToday();
        break;
      default:
        dateFilter = null;
    }

    // 期間別ランキングの場合は、xp_transactionsテーブルから集計
    if (dateFilter) {
      // RPC関数を使用してデータベース側で集計を行う
      const { data: periodRankingData, error: rpcError } = await supabase.rpc(
        "get_period_ranking",
        {
          p_start_date: dateFilter.toISOString(),
          p_limit: limit,
        },
      );

      if (rpcError) {
        console.error("Failed to fetch period ranking:", rpcError);
        throw new Error(
          `期間別ランキングの取得に失敗しました: ${rpcError.message}`,
        );
      }

      return periodRankingData || [];
    }
    // 全期間の場合は既存のビューを使用
    const { data, error } = await supabase
      .from("user_ranking_view")
      .select("*")
      .limit(limit);

    if (error) {
      console.error("Failed to fetch ranking:", error);
      throw new Error(`ランキングデータの取得に失敗しました: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Ranking service error:", error);
    throw error;
  }
}
