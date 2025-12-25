import "server-only";

import { getPartyMembershipMap } from "@/features/party-membership/services/memberships";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import { getJSTMidnightToday } from "@/lib/utils/date-utils";
import type { RankingPeriod, UserRanking } from "../types/ranking-types";

export async function getRanking(
  limit = 10,
  period: RankingPeriod = "all",
  seasonId?: string,
): Promise<UserRanking[]> {
  try {
    const supabase = createClient();

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

    const rankings = periodRankingData || [];
    const membershipMap = await getPartyMembershipMap(
      rankings
        .map((ranking) => ranking.user_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    );

    return rankings.map((ranking) => ({
      ...ranking,
      party_membership:
        ranking.user_id && membershipMap[ranking.user_id]
          ? membershipMap[ranking.user_id]
          : null,
    }));
  } catch (error) {
    console.error("Ranking service error:", error);
    throw error;
  }
}
