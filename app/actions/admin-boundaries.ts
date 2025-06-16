"use server";

import {
  getAdminBoundariesByPrefecture,
  getAdminBoundariesCount,
  getAdminBoundaryById,
  getCitiesByPrefecture,
  getPrefectures,
  searchAdminBoundaries,
} from "@/lib/services/adminBoundaries";
import type { Database } from "@/lib/types/supabase";

type AdminBoundary = Database["public"]["Tables"]["admin_boundaries"]["Row"];

/**
 * 住所で行政区域を検索するサーバーアクション
 */
export async function searchAdminBoundariesAction(
  query: string,
  limit?: number,
): Promise<{ data: AdminBoundary[] | null; error: string | null }> {
  try {
    if (!query.trim()) {
      return { data: [], error: null };
    }

    const data = await searchAdminBoundaries(query, limit);
    return { data, error: null };
  } catch (error) {
    console.error("住所検索エラー:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "住所検索に失敗しました",
    };
  }
}

/**
 * IDで行政区域を取得するサーバーアクション
 */
export async function getAdminBoundaryByIdAction(
  id: string,
): Promise<{ data: AdminBoundary | null; error: string | null }> {
  try {
    const data = await getAdminBoundaryById(id);
    return { data, error: null };
  } catch (error) {
    console.error("行政区域取得エラー:", error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "行政区域の取得に失敗しました",
    };
  }
}

/**
 * 都道府県別行政区域を取得するサーバーアクション
 */
export async function getAdminBoundariesByPrefectureAction(
  prefectureCode: string,
): Promise<{ data: AdminBoundary[] | null; error: string | null }> {
  try {
    const data = await getAdminBoundariesByPrefecture(prefectureCode);
    return { data, error: null };
  } catch (error) {
    console.error("都道府県別行政区域取得エラー:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "都道府県別行政区域の取得に失敗しました",
    };
  }
}

/**
 * 都道府県一覧を取得するサーバーアクション
 */
export async function getPrefecturesAction(): Promise<{
  data: Array<{ code: string; name: string }> | null;
  error: string | null;
}> {
  try {
    const data = await getPrefectures();
    return { data, error: null };
  } catch (error) {
    console.error("都道府県一覧取得エラー:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "都道府県一覧の取得に失敗しました",
    };
  }
}

/**
 * 市区町村一覧を取得するサーバーアクション
 */
export async function getCitiesByPrefectureAction(
  prefectureCode: string,
): Promise<{
  data: Array<{ name: string }> | null;
  error: string | null;
}> {
  try {
    const data = await getCitiesByPrefecture(prefectureCode);
    return { data, error: null };
  } catch (error) {
    console.error("市区町村一覧取得エラー:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "市区町村一覧の取得に失敗しました",
    };
  }
}

/**
 * 行政区域の件数を取得するサーバーアクション
 */
export async function getAdminBoundariesCountAction(): Promise<{
  data: number | null;
  error: string | null;
}> {
  try {
    const data = await getAdminBoundariesCount();
    return { data, error: null };
  } catch (error) {
    console.error("行政区域件数取得エラー:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "行政区域件数の取得に失敗しました",
    };
  }
}
