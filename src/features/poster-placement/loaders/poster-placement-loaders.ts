"use server";

import type { ReverseGeocodingResult } from "@/features/map-posting/services/reverse-geocoding";
import { reverseGeocode } from "@/features/map-posting/services/reverse-geocoding";
import { getCityStats } from "../services/poster-placement-stats";
import type { PosterPlacementCityStats } from "../types/poster-placement-types";

/**
 * 市区町村レベルの集計データを取得する
 * Server Action としてページコンポーネントやクライアントコンポーネントから呼び出し可能
 *
 * @returns 市区町村ごとの集計データ配列（prefecture, city, total_count, placement_count, avg_lat, avg_lng）
 */
export async function fetchCityStats(): Promise<PosterPlacementCityStats[]> {
  return getCityStats();
}

/**
 * 緯度・経度から住所を逆ジオコーディングで取得する
 */
export async function fetchReverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodingResult> {
  return reverseGeocode(lat, lng);
}
