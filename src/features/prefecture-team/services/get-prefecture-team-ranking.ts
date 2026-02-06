import "server-only";

import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import type {
  PrefectureTeamRanking,
  UserPrefectureContribution,
} from "../types/prefecture-team-types";
import {
  type PrefectureTeamRankingRow,
  transformToXpPerCapitaRanking,
} from "../utils/ranking-transform";

interface UserPrefectureContributionRow {
  prefecture: string;
  user_xp: number;
  prefecture_total_xp: number;
  user_rank_in_prefecture: number;
}

/**
 * 都道府県対抗ランキングを取得
 */
export async function getPrefectureTeamRanking(
  seasonId?: string,
): Promise<PrefectureTeamRanking[]> {
  try {
    const supabase = createClient();

    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return [];
    }

    const { data, error } = (await supabase.rpc("get_prefecture_team_ranking", {
      p_season_id: targetSeasonId,
      p_limit: 47,
    })) as { data: PrefectureTeamRankingRow[] | null; error: Error | null };

    if (error) {
      console.error("Failed to fetch prefecture team ranking:", error);
      throw new Error(
        `都道府県対抗ランキングの取得に失敗しました: ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      return [];
    }

    return transformToXpPerCapitaRanking(data);
  } catch (error) {
    console.error("Prefecture team ranking service error:", error);
    throw error;
  }
}

/**
 * ユーザーの都道府県内貢献度を取得
 */
export async function getUserPrefectureContribution(
  userId: string,
  seasonId?: string,
): Promise<UserPrefectureContribution | null> {
  try {
    const supabase = createClient();

    const targetSeasonId = seasonId || (await getCurrentSeasonId());

    if (!targetSeasonId) {
      console.error("Target season not found");
      return null;
    }

    const { data, error } = (await supabase.rpc(
      "get_user_prefecture_contribution",
      {
        p_user_id: userId,
        p_season_id: targetSeasonId,
      },
    )) as { data: UserPrefectureContributionRow[] | null; error: Error | null };

    if (error) {
      console.error("Failed to fetch user prefecture contribution:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const contribution = data[0];

    const contributionPercent =
      contribution.prefecture_total_xp > 0
        ? (contribution.user_xp / contribution.prefecture_total_xp) * 100
        : 0;

    return {
      prefecture: contribution.prefecture,
      userXp: contribution.user_xp,
      prefectureTotalXp: contribution.prefecture_total_xp,
      userRankInPrefecture: contribution.user_rank_in_prefecture,
      contributionPercent,
    };
  } catch (error) {
    console.error("User prefecture contribution service error:", error);
    return null;
  }
}
