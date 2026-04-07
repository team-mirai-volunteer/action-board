"use server";

import type { ReverseGeocodingResult } from "@/lib/services/reverse-geocoding";
import { reverseGeocode } from "@/lib/services/reverse-geocoding";
import { createClient } from "@/lib/supabase/client";
import { getCityStats } from "../services/poster-placement-stats";
import { getPosterPlacementsByUserId } from "../services/poster-placements";
import type {
  PosterPlacement,
  PosterPlacementCityStats,
} from "../types/poster-placement-types";

/**
 * 市区町村レベルの集計データを取得する
 * Server Action としてページコンポーネントやクライアントコンポーネントから呼び出し可能
 *
 * @returns 市区町村ごとの集計データ配列（prefecture, city, total_count, placement_count, avg_lat, avg_lng）
 */
export async function fetchCityStats(): Promise<PosterPlacementCityStats[]> {
  try {
    return await getCityStats();
  } catch (error) {
    console.error("Failed to fetch city stats:", error);
    return [];
  }
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

/**
 * ログインユーザー自身のポスター掲示一覧を取得する
 * 他ユーザーの個別位置情報は一切取得しない
 */
export async function fetchMyPlacements(): Promise<PosterPlacement[]> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    return await getPosterPlacementsByUserId(user.id);
  } catch (error) {
    console.error("Failed to fetch my placements:", error);
    return [];
  }
}
