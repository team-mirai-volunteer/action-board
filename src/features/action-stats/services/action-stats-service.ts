import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type {
  ActionStatsSummary,
  DailyActionItem,
  DailyActiveUsersItem,
  MissionActionRanking,
} from "../types";
import {
  mapMissionRankingResults,
  transformActionStatsResult,
} from "../utils/stats-transform";

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
  const supabase = await createAdminClient();

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

  return transformActionStatsResult(data?.[0]);
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
  const supabase = await createAdminClient();

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
 * 日別アクティブユーザー数推移を取得する（RPC使用）
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 日別アクティブユーザー数（本日以降のデータは除外）
 */
export async function getDailyActiveUsersHistory(
  startDate?: Date,
  endDate?: Date,
): Promise<DailyActiveUsersItem[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc("get_daily_active_users_history", {
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
  });

  if (error) {
    console.error("Failed to fetch daily active users history:", error);
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
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc("get_mission_action_ranking", {
    start_date: startDate?.toISOString(),
    end_date: endDate?.toISOString(),
    limit_count: limit,
  });

  if (error) {
    console.error("Failed to fetch mission action ranking:", error);
    return [];
  }

  return mapMissionRankingResults(data ?? []);
}
