import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type {
  PosterPlacement,
  PosterPlacementInsert,
} from "../types/poster-placement-types";

/**
 * ポスター掲示を作成する
 *
 * @param placement - 作成するポスター掲示データ（user_id, lat, lng, count は必須。
 *   prefecture, city, address, postcode は呼び出し元で逆ジオコーディング済みの値を渡す）
 * @returns 作成されたレコード
 */
export async function createPosterPlacement(
  placement: PosterPlacementInsert,
): Promise<PosterPlacement> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .insert(placement)
    .select()
    .single();

  if (error) {
    console.error("Error creating poster placement:", error);
    throw error;
  }

  return data;
}

/**
 * 指定ユーザーのポスター掲示一覧を取得する（新しい順）
 *
 * @param userId - ユーザーID
 * @returns ポスター掲示の配列
 */
export async function getPosterPlacementsByUserId(
  userId: string,
): Promise<PosterPlacement[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching poster placements:", error);
    throw error;
  }

  return data;
}

/**
 * ポスター掲示を ID で取得する
 *
 * @param id - ポスター掲示ID
 * @returns ポスター掲示レコード、見つからない場合は null
 */
export async function getPosterPlacementById(
  id: string,
): Promise<PosterPlacement | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching poster placement:", error);
    throw error;
  }

  return data;
}

/**
 * ポスター掲示を削除する
 *
 * @param id - 削除するポスター掲示のID
 */
export async function deletePosterPlacement(id: string): Promise<void> {
  const supabase = await createAdminClient();

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
 * ポスター掲示レコードの mission_artifact_id を更新する
 *
 * @param id - ポスター掲示レコードの ID
 * @param missionArtifactId - 紐付ける mission_artifact の ID
 */
export async function updatePosterPlacementArtifactId(
  id: string,
  missionArtifactId: string,
): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("poster_placements")
    .update({ mission_artifact_id: missionArtifactId })
    .eq("id", id);

  if (error) {
    console.error("Error updating poster placement artifact id:", error);
    throw error;
  }
}

/**
 * 指定ユーザーのポスター掲示合計枚数を取得する
 *
 * @param userId - ユーザーID
 * @returns 合計掲示枚数
 */
export async function getUserPosterPlacementCount(
  userId: string,
): Promise<number> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("poster_placements")
    .select("count")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user poster placement count:", error);
    throw error;
  }

  return data.reduce((sum, row) => sum + (row.count ?? 0), 0);
}

/**
 * ポスター掲示レコードのフィールドを更新する
 *
 * @param id - ポスター掲示レコードの ID
 * @param fields - 更新するフィールド
 */
export async function updatePosterPlacementFields(
  id: string,
  fields: { address?: string | null; count?: number; memo?: string | null },
): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("poster_placements")
    .update(fields)
    .eq("id", id);

  if (error) {
    console.error("Error updating poster placement fields:", error);
    throw error;
  }
}
