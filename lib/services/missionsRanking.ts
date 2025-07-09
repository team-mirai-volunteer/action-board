import "server-only";

import type { RankingPeriod } from "@/components/ranking/period-toggle";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export interface UserMissionRanking extends UserRanking {
  user_achievement_count: number | null;
  total_points: number | null;
}

export async function getMissionRanking(
  missionId: string,
  limit = 10,
  period: RankingPeriod = "all",
): Promise<UserMissionRanking[]> {
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

    // データベース関数を使用してランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      period === "all" ? "get_mission_ranking" : "get_period_mission_ranking",
      period === "all"
        ? {
            mission_id: missionId,
            limit_count: limit,
          }
        : {
            p_mission_id: missionId,
            p_limit: limit,
            p_start_date: dateFilter?.toISOString(),
          },
    );

    if (rankingsError) {
      console.error("Failed to fetch mission rankings:", rankingsError);
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
        (ranking: Record<string, unknown>) =>
          ({
            user_id: ranking.user_id,
            name: ranking.user_name,
            address_prefecture: ranking.address_prefecture,
            rank: ranking.rank,
            level: ranking.level,
            xp: ranking.xp,
            updated_at: ranking.updated_at,
            user_achievement_count: ranking.clear_count,
            total_points: ranking.total_points,
          }) as UserMissionRanking,
      );
    }
    // 期間別の場合
    return rankings.map(
      (ranking: Record<string, unknown>) =>
        ({
          user_id: ranking.user_id,
          name: ranking.name,
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
  period: RankingPeriod = "all",
): Promise<UserMissionRanking | null> {
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

    // データベース関数を使用して特定ユーザーのランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      period === "all"
        ? "get_user_mission_ranking"
        : "get_user_period_mission_ranking",
      period === "all"
        ? {
            mission_id: missionId,
            user_id: userId,
          }
        : {
            p_mission_id: missionId,
            p_user_id: userId,
            p_start_date: dateFilter?.toISOString(),
          },
    );

    if (rankingsError) {
      console.error("Failed to fetch user mission ranking:", rankingsError);
      throw new Error(
        `ユーザーのミッションランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
      return null;
    }

    const ranking = rankings[0] as Record<string, unknown>;
    if (period === "all") {
      return {
        user_id: ranking.user_id,
        name: ranking.user_name,
        address_prefecture: ranking.address_prefecture,
        rank: ranking.rank,
        level: ranking.level,
        xp: ranking.xp,
        updated_at: ranking.updated_at,
        user_achievement_count: ranking.clear_count,
        total_points: ranking.total_points,
      } as UserMissionRanking;
    }
    // 期間別の場合
    return {
      user_id: ranking.user_id,
      name: ranking.name,
      address_prefecture: ranking.address_prefecture,
      rank: ranking.rank,
      level: null,
      xp: null,
      updated_at: null,
      user_achievement_count: ranking.user_achievement_count,
      total_points: ranking.total_points,
    } as UserMissionRanking;
  } catch (error) {
    console.error("User mission ranking service error:", error);
    throw error;
  }
}

export async function getUserPostingCount(userId: string): Promise<number> {
  const supabase = await createClient();
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

export async function getTopUsersPostingCount(
  userIds: string[],
): Promise<{ user_id: string; posting_count: number }[]> {
  const supabase = await createClient();
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
