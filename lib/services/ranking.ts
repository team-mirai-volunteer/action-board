import "server-only";

import type { RankingPeriod } from "@/components/ranking/period-toggle";
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
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前
        break;
      case "weekly":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7日前
        break;
      default:
        dateFilter = null;
    }

    // 期間別ランキングの場合は、xp_transactionsテーブルから集計
    if (dateFilter) {
      // xp_transactionsから期間内のXPを集計
      const { data: xpData, error: xpError } = await supabase
        .from("xp_transactions")
        .select("user_id, xp_amount")
        .gte("created_at", dateFilter.toISOString())
        .not("user_id", "is", null);

      if (xpError) {
        console.error("Failed to fetch xp transactions:", xpError);
        throw new Error(
          `XPトランザクションの取得に失敗しました: ${xpError.message}`,
        );
      }

      // ユーザーごとのXPを集計
      const userXpMap = new Map<string, number>();
      if (xpData) {
        for (const transaction of xpData) {
          if (transaction.user_id) {
            userXpMap.set(
              transaction.user_id,
              (userXpMap.get(transaction.user_id) || 0) +
                (transaction.xp_amount || 0),
            );
          }
        }
      }

      // XPが0より大きいユーザーのIDリスト
      const userIds = Array.from(userXpMap.keys());

      if (userIds.length === 0) {
        return [];
      }

      // ユーザー情報を取得
      const { data: users, error: usersError } = await supabase
        .from("public_user_profiles")
        .select("id, name, address_prefecture")
        .in("id", userIds);

      if (usersError) {
        console.error("Failed to fetch user profiles:", usersError);
        throw new Error(
          `ユーザープロフィールの取得に失敗しました: ${usersError.message}`,
        );
      }

      // レベル情報を取得
      const { data: levels, error: levelsError } = await supabase
        .from("user_levels")
        .select("user_id, level, xp")
        .in("user_id", userIds);

      if (levelsError) {
        console.error("Failed to fetch user levels:", levelsError);
        throw new Error(
          `ユーザーレベルの取得に失敗しました: ${levelsError.message}`,
        );
      }

      // データを結合してランキングを作成
      const levelMap = new Map(levels?.map((l) => [l.user_id, l]) || []);

      const rankings =
        users?.map((user) => {
          const periodXp = userXpMap.get(user.id ?? "") || 0;
          const levelInfo = levelMap.get(user.id ?? "");

          return {
            user_id: user.id,
            name: user.name,
            address_prefecture: user.address_prefecture,
            rank: null, // 後でソート後に設定
            level: levelInfo?.level || null,
            xp: periodXp, // 期間内のXP
            updated_at: null,
          };
        }) || [];

      // XPでソートしてランクを設定
      rankings.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const rankedUsers = rankings.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      return rankedUsers.slice(0, limit);
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
