import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export interface UserMissionRanking extends UserRanking {
  user_achievement_count: number | null;
  total_points: number | null;
}

export async function getMissionRanking(
  missionId: string,
  limit = 10,
): Promise<UserMissionRanking[]> {
  try {
    const supabase = await createClient();

    // データベース関数を使用してランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      "get_mission_ranking",
      {
        mission_id: missionId,
        limit_count: limit,
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
          user_achievement_count: ranking.clear_count,
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
): Promise<UserMissionRanking | null> {
  try {
    const supabase = await createClient();

    // データベース関数を使用して特定ユーザーのランキングを取得
    const { data: rankings, error: rankingsError } = await supabase
      .rpc("get_user_mission_ranking", {
        mission_id: missionId,
        user_id: userId,
      })
      .limit(1);

    if (rankingsError) {
      console.error("Failed to fetch user mission ranking:", rankingsError);
      throw new Error(
        `ユーザーのミッションランキングデータの取得に失敗しました: ${rankingsError.message}`,
      );
    }

    if (!rankings || rankings.length === 0) {
      return null;
    }

    const ranking = rankings[0];
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
