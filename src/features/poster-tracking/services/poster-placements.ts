import "server-only";

import { reverseGeocode } from "@/features/map-posting/services/reverse-geocoding";
import { createAdminClient } from "@/lib/supabase/adminClient";
import type {
  CityContributor,
  CityStats,
  CreatePlacementInput,
  PosterPlacement,
  UpdatePlacementInput,
} from "../types/poster-tracking-types";

/**
 * poster_placements テーブルはマイグレーション後に Supabase 型が自動生成される。
 * それまでは型安全にアクセスできないため、ヘルパーで any キャストする。
 */
// biome-ignore lint/suspicious/noExplicitAny: poster_placements is not yet in generated types
async function getClient(): Promise<any> {
  return createAdminClient();
}

/**
 * 掲示記録を作成する（逆ジオコーディングで住所情報を自動取得）
 */
export async function createPlacement(
  userId: string,
  input: CreatePlacementInput,
): Promise<PosterPlacement> {
  const supabase = await getClient();

  const geocoded = await reverseGeocode(input.lat, input.lng);

  const { data, error } = await supabase
    .from("poster_placements")
    .insert({
      user_id: userId,
      lat: input.lat,
      lng: input.lng,
      prefecture: geocoded.prefecture,
      city: geocoded.city,
      address: input.address || geocoded.address,
      postcode: geocoded.postcode,
      poster_count: input.poster_count,
      note: input.note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating poster placement:", error);
    throw error;
  }

  return data as PosterPlacement;
}

/**
 * ユーザーの掲示記録一覧を取得する
 */
export async function getUserPlacements(
  userId: string,
): Promise<PosterPlacement[]> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading user placements:", error);
    throw error;
  }

  return (data ?? []) as PosterPlacement[];
}

/**
 * 掲示記録を更新する
 */
export async function updatePlacement(
  id: string,
  input: UpdatePlacementInput,
): Promise<PosterPlacement> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating poster placement:", error);
    throw error;
  }

  return data as PosterPlacement;
}

/**
 * 掲示記録を削除する
 */
export async function deletePlacement(id: string): Promise<void> {
  const supabase = await getClient();

  const { error } = await supabase
    .from("poster_placements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting poster placement:", error);
    throw error;
  }
}

/**
 * 掲示記録の所有者であることを確認する
 */
export async function authorizePlacementOwner(
  id: string,
  userId: string,
): Promise<void> {
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .select("user_id")
    .eq("id", id)
    .single();

  if (error || !data) {
    throw new Error("掲示記録が見つかりません");
  }

  if (data.user_id !== userId) {
    throw new Error("この掲示記録を操作する権限がありません");
  }
}

/**
 * 市区町村別の集計データを取得する（公開用）
 */
export async function getStatsByCity(): Promise<CityStats[]> {
  const supabase = await getClient();

  const { data, error } = await supabase.rpc(
    "get_poster_placement_stats_by_city",
  );

  if (error) {
    console.error("Error fetching poster placement stats:", error);
    throw error;
  }

  return (data ?? []) as CityStats[];
}

/**
 * 特定市区町村の貢献者別集計を取得する（公開用）
 */
export async function getCityDetail(
  prefecture: string,
  city: string,
): Promise<CityContributor[]> {
  const supabase = await getClient();

  const { data, error } = await supabase.rpc(
    "get_poster_placement_city_detail",
    {
      p_prefecture: prefecture,
      p_city: city,
    },
  );

  if (error) {
    console.error("Error fetching city detail:", error);
    throw error;
  }

  return (data ?? []) as CityContributor[];
}
