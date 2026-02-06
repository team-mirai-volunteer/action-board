import "server-only";

import {
  getPartyMembership,
  getPartyMembershipMap,
} from "@/features/party-membership/services/memberships";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import type { RankingPeriod, UserRanking } from "../types/ranking-types";
import {
  dateFilterToISOString,
  getPeriodDateFilter,
} from "../utils/period-utils";
import { attachPartyMembership } from "../utils/ranking-helpers";

export async function getPrefecturesRanking(
  prefecture: string,
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
    const dateFilter = getPeriodDateFilter(period);

    // シーズン対応の都道府県別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_period_prefecture_ranking",
      {
        p_prefecture: prefecture,
        p_limit: limit,
        p_start_date: dateFilterToISOString(dateFilter),
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

    const membershipMap = await getPartyMembershipMap(
      rankings
        .map((ranking) => ranking.user_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    );

    // ランキングデータを変換（period_prefecture_rankingの結果形式）
    const mapped = rankings.map((ranking: Record<string, unknown>) => ({
      user_id: ranking.user_id as string | null,
      name: ranking.name,
      address_prefecture: prefecture,
      rank: ranking.rank,
      level: ranking.level,
      xp: ranking.xp,
      updated_at: ranking.updated_at,
    }));
    return attachPartyMembership(mapped, membershipMap) as UserRanking[];
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
    const supabase = createClient();

    // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return null;
    }

    // 期間に応じた日付フィルタを設定
    const dateFilter = getPeriodDateFilter(period);

    // シーズン対応の特定ユーザーの都道府県別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_user_period_prefecture_ranking",
      {
        p_prefecture: prefecture,
        p_user_id: userId,
        p_start_date: dateFilterToISOString(dateFilter),
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

    const membership = await getPartyMembership(userId);

    return {
      user_id: userId,
      name: ranking.name,
      address_prefecture: ranking.address_prefecture,
      rank: ranking.rank,
      level: ranking.level,
      xp: ranking.xp,
      updated_at: ranking.updated_at,
      party_membership: membership,
    } as UserRanking;
  } catch (error) {
    console.error("User prefecture ranking service error:", error);
    throw error;
  }
}
