import "server-only";

import { getJSTMidnightToday } from "@/lib/dateUtils";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/client";
import type { RankingPeriod, UserMissionRanking } from "../types/ranking-types";

export async function getMissionRanking(
  missionId: string,
  limit = 10,
  period: RankingPeriod = "all",
  seasonId?: string,
): Promise<UserMissionRanking[]> {
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

    // シーズン対応のミッション別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_period_mission_ranking",
      {
        p_mission_id: missionId,
        p_limit: limit,
        p_start_date: dateFilter?.toISOString() || undefined,
        p_season_id: targetSeasonId,
      },
    );

    if (rankingsError) {
      console.log("Failed to fetch mission rankings:", rankingsError);
      throw new Error(
        `ミッションランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || rankings.length === 0) {
      return [];
    }

    // ランキングデータを変換
    if (period === "all") {
      return rankings.map(
        (ranking) =>
          ({
            user_id: ranking.user_id,
            name: ranking.user_name,
            address_prefecture: ranking.address_prefecture,
            rank: ranking.rank,
            level: ranking.level,
            xp: ranking.xp,
            updated_at: ranking.updated_at,
            user_achievement_count: ranking.user_achievement_count,
            total_points: ranking.total_points,
          }) as UserMissionRanking,
      );
    }
    // 期間別の場合
    return rankings.map(
      (ranking) =>
        ({
          user_id: ranking.user_id,
          name: ranking.user_name,
          address_prefecture: ranking.address_prefecture,
          rank: ranking.rank,
          level: null, // 期間別では取得しない
          xp: null, // 期間別では取得しない
          updated_at: null,
          user_achievement_count: ranking.user_achievement_count,
          total_points: ranking.total_points,
        }) as UserMissionRanking,
    );
  } catch (error) {
    console.error("Mission ranking service error:", error);
    throw error;
  }
}

export async function getUserMissionRanking(
  missionId: string,
  userId: string,
  seasonId?: string,
  period: RankingPeriod = "all",
): Promise<UserMissionRanking | null> {
  try {
    const supabase = createClient();

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

    // シーズン対応の特定ユーザーのミッションランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_user_period_mission_ranking",
      {
        p_mission_id: missionId,
        p_user_id: userId,
        p_start_date: dateFilter?.toISOString() || undefined,
        p_season_id: targetSeasonId,
      },
    );

    if (rankingsError) {
      console.log("Failed to fetch user mission ranking:", rankingsError);
      throw new Error(
        `ユーザーのミッションランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
      return null;
    }

    const ranking = rankings[0] as Record<string, unknown>;

    return {
      user_id: ranking.user_id,
      name: ranking.user_name,
      address_prefecture: ranking.address_prefecture,
      rank: ranking.rank,
      level: ranking.level,
      xp: ranking.xp,
      updated_at: ranking.updated_at,
      user_achievement_count: ranking.user_achievement_count,
      total_points: ranking.total_points,
    } as UserMissionRanking;
  } catch (error) {
    console.error("User mission ranking service error:", error);
    throw error;
  }
}

export async function getUserPostingCount(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_user_posting_count", {
    target_user_id: userId,
  });

  if (error) {
    console.error("Failed to fetch user posting count:", {
      userId,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      timestamp: new Date().toISOString(),
    });
    return 0;
  }

  // dataがnullやundefinedの場合は0を返す
  return typeof data === "number" ? data : 0;
}

export async function getUserPostingCountByMission(
  userId: string,
  missionId: string,
  seasonId?: string,
): Promise<number> {
  const supabase = createClient();

  // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
  const targetSeasonId = seasonId || (await getCurrentSeasonId());

  if (!targetSeasonId) {
    console.error("Target season not found");
    return 0;
  }

  const { data, error } = await supabase.rpc(
    "get_user_posting_count_by_mission",
    {
      target_user_id: userId,
      target_mission_id: missionId,
      p_season_id: targetSeasonId,
    },
  );

  if (error) {
    console.error("Failed to fetch user posting count by mission:", {
      userId,
      missionId,
      errorMessage: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      timestamp: new Date().toISOString(),
    });
    return 0;
  }

  // dataがnullやundefinedの場合は0を返す
  return typeof data === "number" ? data : 0;
}

export async function getTopUsersPostingCount(
  userIds: string[],
): Promise<{ user_id: string; posting_count: number }[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_top_users_posting_count", {
    user_ids: userIds,
  });

  if (error) {
    console.error("Failed to fetch users posting count:", error);
    throw new Error(
      `ユーザーのポスティング枚数取得に失敗しました: ${error.message}`,
    );
  }

  // dataがnullやundefinedの場合は空配列を返す
  return (data as { user_id: string; posting_count: number }[]) || [];
}

export async function getTopUsersPostingCountByMission(
  userIds: string[],
  missionId: string,
  seasonId?: string,
): Promise<{ user_id: string; posting_count: number }[]> {
  const supabase = createClient();

  // seasonIdが指定されている場合はそれを使用、そうでなければ現在のシーズン
  const targetSeasonId = seasonId || (await getCurrentSeasonId());

  const { data, error } = await supabase.rpc(
    "get_top_users_posting_count_by_mission",
    {
      user_ids: userIds,
      target_mission_id: missionId,
      p_season_id: targetSeasonId ?? undefined, // シーズンIDが指定されていない場合はundefinedを渡す
    },
  );

  if (error) {
    console.error("Failed to fetch users posting count by mission:", error);
    throw new Error(
      `ミッション別ユーザーのポスティング枚数取得に失敗しました: ${error.message}`,
    );
  }

  // dataがnullやundefinedの場合は空配列を返す
  return (data as { user_id: string; posting_count: number }[]) || [];
}
