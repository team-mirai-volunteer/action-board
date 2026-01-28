import "server-only";

import { createClient } from "@/lib/supabase/client";
import type {
  ActionStatsSummary,
  DailyActionItem,
  MissionActionRanking,
} from "../types";

/**
 * アクション統計サマリーを取得する（RPC使用）
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns サマリー統計
 */
export async function getActionStatsSummary(
  startDate?: Date,
  endDate?: Date,
): Promise<ActionStatsSummary> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_action_stats_summary", {
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
  });

  if (error) {
    console.error("Failed to fetch action stats summary:", error);
    return {
      totalActions: 0,
      activeUsers: 0,
    };
  }

  const result = data?.[0];
  return {
    totalActions: Number(result?.total_actions ?? 0),
    activeUsers: Number(result?.active_users ?? 0),
    dailyActionsIncrease: Number(result?.daily_actions_increase ?? 0),
    dailyUsersIncrease: Number(result?.daily_users_increase ?? 0),
  };
}

/**
 * 日別アクション推移を取得する（RPC使用）
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 日別アクション数（本日以降のデータは除外）
 */
export async function getDailyActionHistory(
  startDate?: Date,
  endDate?: Date,
): Promise<DailyActionItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_daily_action_history", {
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
  });

  if (error) {
    console.error("Failed to fetch daily action history:", error);
    return [];
  }

  // 本日以降のデータを除外
  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  const items = (data ?? []).map((item: { date: string; count: number }) => ({
    date: item.date,
    count: Number(item.count),
  }));
  return filterBeforeToday(items);
}

/**
 * ミッション別アクションランキングを取得する（RPC使用）
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @param limit - 取得件数（デフォルト20件）
 * @returns ミッション別アクション数
 */
export async function getMissionActionRanking(
  startDate?: Date,
  endDate?: Date,
  limit = 20,
): Promise<MissionActionRanking[]> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_mission_action_ranking", {
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
    limit_count: limit,
  });

  if (error) {
    console.error("Failed to fetch mission action ranking:", error);
    return [];
  }

  return (data ?? []).map(
    (item: {
      mission_id: string;
      mission_title: string;
      mission_slug: string;
      icon_url: string | null;
      action_count: number;
      is_hidden: boolean;
    }) => ({
      missionId: item.mission_id,
      missionTitle: item.mission_title,
      missionSlug: item.mission_slug,
      iconUrl: item.icon_url,
      actionCount: Number(item.action_count),
      isHidden: item.is_hidden,
    }),
  );
}
