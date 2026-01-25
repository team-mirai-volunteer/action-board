import "server-only";

import {
  getPartyMembership,
  getPartyMembershipMap,
} from "@/features/party-membership/services/memberships";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import { getJSTMidnightToday } from "@/lib/utils/date-utils";
import type { RankingPeriod, UserRanking } from "../types/ranking-types";

export interface UserPeriodRanking {
  user_id: string;
  address_prefecture: string | null;
  level: number;
  name: string;
  rank: number;
  updated_at: string | null;
  xp: number;
  party_membership: Awaited<ReturnType<typeof getPartyMembership>>;
}

/**
 * 現在のユーザーの期間別ランキング情報を取得
 */
export async function getUserPeriodRanking(
  userId: string,
  seasonId: string,
  period: RankingPeriod = "all",
): Promise<UserPeriodRanking | null> {
  const supabase = createClient();

  // 期間フィルター計算
  let dateFilter: Date | null = null;
  if (period === "daily") {
    dateFilter = getJSTMidnightToday();
  }

  const { data, error } = await supabase.rpc("get_user_period_ranking", {
    target_user_id: userId,
    start_date: dateFilter?.toISOString() || undefined,
    p_season_id: seasonId,
  });

  if (error) {
    console.error("Error fetching user period ranking:", error);
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  // パーティメンバーシップ情報を取得
  const partyMembership = await getPartyMembership(userId);

  return {
    user_id: data[0].user_id,
    address_prefecture: data[0].address_prefecture,
    level: data[0].level,
    name: data[0].name,
    rank: data[0].rank,
    updated_at: data[0].updated_at,
    xp: data[0].xp,
    party_membership: partyMembership,
  };
}

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
