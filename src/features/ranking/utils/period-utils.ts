import { getJSTMidnightToday } from "@/lib/utils/date-utils";
import type { RankingPeriod } from "../types/ranking-types";

/**
 * RankingPeriod から日付フィルタを計算する
 */
export function getPeriodDateFilter(period: RankingPeriod): Date | null {
  switch (period) {
    case "daily":
      return getJSTMidnightToday();
    default:
      return null;
  }
}

/**
 * 日付フィルタをISO文字列に変換する（RPC パラメータ用）
 */
export function dateFilterToISOString(
  dateFilter: Date | null,
): string | undefined {
  return dateFilter?.toISOString() || undefined;
}
