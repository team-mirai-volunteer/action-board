import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { ResidentialPosterCityStats } from "../types/residential-poster-types";

/**
 * 市区町村レベルのポスター掲示集計を取得する
 * createAdminClient（service_role）を使用して RLS をバイパスし、全ユーザー分を集計する
 *
 * @returns 市区町村ごとの集計データ配列
 */
export async function getCityStats(): Promise<ResidentialPosterCityStats[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("residential_poster_city_stats")
    .select("*");

  if (error) {
    console.error("Error fetching city stats:", error);
    throw error;
  }

  return data;
}

/**
 * 特定の都道府県の市区町村レベル集計を取得する
 *
 * @param prefecture - 都道府県名
 * @returns 該当都道府県の市区町村ごとの集計データ配列
 */
export async function getCityStatsByPrefecture(
  prefecture: string,
): Promise<ResidentialPosterCityStats[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("residential_poster_city_stats")
    .select("*")
    .eq("prefecture", prefecture);

  if (error) {
    console.error("Error fetching city stats by prefecture:", error);
    throw error;
  }

  return data;
}

/**
 * ポスター掲示の全国合計を取得する
 *
 * @returns { totalCount: 合計枚数, placementCount: 報告件数 }
 */
export async function getTotalStats(): Promise<{
  totalCount: number;
  placementCount: number;
}> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("residential_poster_city_stats")
    .select("total_count, placement_count");

  if (error) {
    console.error("Error fetching total stats:", error);
    throw error;
  }

  return {
    totalCount: data.reduce(
      (sum, row) => sum + (Number(row.total_count) || 0),
      0,
    ),
    placementCount: data.reduce(
      (sum, row) => sum + (Number(row.placement_count) || 0),
      0,
    ),
  };
}
