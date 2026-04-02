import type { CityStats } from "../types/poster-tracking-types";

/**
 * 市区町村の掲示数に応じてコロプレスマップの色を返す
 */
export function getChoroplethColor(count: number): string {
  if (count === 0) return "#f3f4f6"; // gray-100
  if (count <= 5) return "#bbf7d0"; // green-200
  if (count <= 20) return "#86efac"; // green-300
  if (count <= 50) return "#4ade80"; // green-400
  if (count <= 100) return "#22c55e"; // green-500
  return "#16a34a"; // green-600
}

/**
 * 集計データを prefecture+city キーでルックアップ可能にする
 */
export function buildStatsLookup(stats: CityStats[]): Map<string, CityStats> {
  const map = new Map<string, CityStats>();
  for (const s of stats) {
    map.set(`${s.prefecture}${s.city}`, s);
  }
  return map;
}
