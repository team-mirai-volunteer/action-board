import "server-only";

import type { RankingPeriod } from "@/components/ranking/period-toggle";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";
import type { UserRanking } from "./ranking";

export async function getPrefecturesRanking(
  prefecture: string,
  limit = 10,
  period: RankingPeriod = "all",
): Promise<UserRanking[]> {
  try {
    const supabase = await createClient();

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

    // データベース関数を使用して都道府県別ランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      period === "all"
        ? "get_prefecture_ranking"
        : "get_period_prefecture_ranking",
      period === "all"
        ? {
            prefecture: prefecture,
            limit_count: limit,
          }
        : {
            p_prefecture: prefecture,
            p_limit: limit,
            p_start_date: dateFilter?.toISOString(),
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
          }) as UserRanking,
      );
    }
    // 期間別の場合
    return rankings.map(
      (ranking: Record<string, unknown>) =>
        ({
          user_id: ranking.user_id,
          name: ranking.name,
          address_prefecture: prefecture, // 都道府県は取得されないので引数を使用
          rank: ranking.rank,
          level: null, // 期間別では取得しない
          xp: ranking.xp,
          updated_at: null,
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
  period: RankingPeriod = "all",
): Promise<UserRanking | null> {
  try {
    const supabase = await createClient();

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

    // データベース関数を使用して特定ユーザーのランキングを取得
    const { data: rankings, error: rankingsError } = await supabase.rpc(
      period === "all"
        ? "get_user_prefecture_ranking"
        : "get_user_period_prefecture_ranking",
      period === "all"
        ? {
            prefecture: prefecture,
            target_user_id: userId,
          }
        : {
            p_prefecture: prefecture,
            p_user_id: userId,
            p_start_date: dateFilter?.toISOString(),
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
    if (period === "all") {
      return {
        user_id: ranking.user_id,
        name: ranking.user_name,
        address_prefecture: ranking.address_prefecture,
        rank: ranking.rank,
        level: ranking.level,
        xp: ranking.xp,
        updated_at: ranking.updated_at,
      } as UserRanking;
    }
    // 期間別の場合
    return {
      user_id: ranking.user_id,
      name: ranking.name,
      address_prefecture: prefecture,
      rank: ranking.rank,
      level: null,
      xp: ranking.xp,
      updated_at: null,
    } as UserRanking;
  } catch (error) {
    console.error("User prefecture ranking service error:", error);
    throw error;
  }
}
