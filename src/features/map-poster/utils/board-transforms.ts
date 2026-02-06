import type { BoardStatus } from "../types/poster-types";
import { createEmptyStatusCounts } from "./poster-stats";

/**
 * RPC集計結果（各行にcount値を持つ）から、キー別のサマリーレコードを構築する
 * getPosterBoardSummaryByPrefecture, getArchivedPosterBoardSummaryで使用
 */
export function buildSummaryFromAggregatedRows<
  T extends { status: string; count: number },
>(
  rows: T[],
  getKey: (row: T) => string | null,
): Record<string, { total: number; statuses: Record<BoardStatus, number> }> {
  const summary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  > = {};

  for (const row of rows) {
    const key = getKey(row);
    if (!key) continue;

    if (!summary[key]) {
      summary[key] = {
        total: 0,
        statuses: createEmptyStatusCounts(),
      };
    }
    summary[key].statuses[row.status as BoardStatus] = row.count;
    summary[key].total += row.count;
  }

  return summary;
}

/**
 * 個別行データ（各行がstatus値を1件持つ）から、キー別のサマリーレコードを構築する
 * getPosterBoardSummaryByDistrictで使用
 */
export function buildSummaryFromIndividualRows<T extends { status: string }>(
  rows: T[],
  getKey: (row: T) => string | null,
): Record<string, { total: number; statuses: Record<BoardStatus, number> }> {
  const summary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  > = {};

  for (const row of rows) {
    const key = getKey(row);
    if (!key) continue;

    if (!summary[key]) {
      summary[key] = {
        total: 0,
        statuses: createEmptyStatusCounts(),
      };
    }
    summary[key].statuses[row.status as BoardStatus] += 1;
    summary[key].total += 1;
  }

  return summary;
}

/**
 * データ配列から特定フィールドの一意な値を抽出する
 */
export function extractUniqueValues<T>(
  data: T[],
  getValue: (item: T) => string | null | undefined,
): string[] {
  return Array.from(
    new Set(data.map(getValue).filter((v): v is string => v != null)),
  );
}
