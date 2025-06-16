import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

type AdminBoundary = Database["public"]["Tables"]["admin_boundaries"]["Row"];
type AdminBoundaryInsert =
  Database["public"]["Tables"]["admin_boundaries"]["Insert"];

// 拡張された型定義（新しいカラムを含む）
type AdminBoundaryWithMerge = AdminBoundary & {
  is_merged?: boolean;
  original_count?: number;
  geometry?: unknown;
};

export async function searchAdminBoundaries(
  query: string,
  limit = 20,
): Promise<AdminBoundary[]> {
  const supabase = await createClient();

  // マージされたデータを優先的に取得
  const { data, error } = await supabase
    .from("admin_boundaries")
    .select("*")
    .or(
      `prefecture_name.ilike.%${query}%,city_name.ilike.%${query}%,district_name.ilike.%${query}%,area_name.ilike.%${query}%,full_address.ilike.%${query}%`,
    )
    .or("is_merged.eq.true,is_merged.eq.false") // マージされたものを優先、なければ元のデータ
    .order("is_merged", { ascending: false }) // マージされたデータを先に
    .order("prefecture_name", { ascending: true })
    .order("city_name", { ascending: true })
    .order("district_name", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`行政区域の検索に失敗しました: ${error.message}`);
  }

  // 型アサーション: データベースには新しいカラムがあるが、型定義がまだ更新されていない
  const dataWithMerge = data as AdminBoundaryWithMerge[];

  // 重複除去: 同じ行政区域でマージされたものがある場合は、マージされたもののみを返す
  // prefecture_name, city_name, district_nameで統合判定
  const uniqueData = dataWithMerge?.reduce((acc, item) => {
    const key = `${item.prefecture_name}-${item.city_name || ""}-${item.district_name || ""}`;
    const existing = acc.find(
      (a) =>
        `${a.prefecture_name}-${a.city_name || ""}-${a.district_name || ""}` ===
        key,
    );

    if (!existing) {
      acc.push(item);
    } else if (item.is_merged && !existing.is_merged) {
      // マージされたデータで置き換え
      const index = acc.indexOf(existing);
      acc[index] = item;
    }

    return acc;
  }, [] as AdminBoundaryWithMerge[]);

  return (uniqueData as AdminBoundary[]) || [];
}

export async function getAdminBoundaryById(
  id: string,
): Promise<AdminBoundary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_boundaries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`行政区域の取得に失敗しました: ${error.message}`);
  }

  return data;
}

export async function getAdminBoundariesByPrefecture(
  prefectureCode: string,
): Promise<AdminBoundary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_boundaries")
    .select("*")
    .eq("prefecture_code", prefectureCode)
    .order("city_name", { ascending: true })
    .order("district_name", { ascending: true });

  if (error) {
    throw new Error(`都道府県の行政区域の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

export async function insertAdminBoundaries(
  boundaries: AdminBoundaryInsert[],
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("admin_boundaries").insert(boundaries);

  if (error) {
    throw new Error(`行政区域の保存に失敗しました: ${error.message}`);
  }
}

export async function deleteAllAdminBoundaries(): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("admin_boundaries")
    .delete()
    .neq("id", "");

  if (error) {
    throw new Error(`行政区域データの削除に失敗しました: ${error.message}`);
  }
}

/**
 * 都道府県一覧を取得
 */
export async function getPrefectures(): Promise<
  Array<{ code: string; name: string }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_boundaries")
    .select("prefecture_code, prefecture_name")
    .order("prefecture_code", { ascending: true });

  if (error) {
    throw new Error(`都道府県一覧の取得に失敗しました: ${error.message}`);
  }

  // 重複を除去
  const uniquePrefectures = data?.reduce(
    (acc, item) => {
      if (!acc.find((p) => p.code === item.prefecture_code)) {
        acc.push({
          code: item.prefecture_code,
          name: item.prefecture_name,
        });
      }
      return acc;
    },
    [] as Array<{ code: string; name: string }>,
  );

  return uniquePrefectures || [];
}

/**
 * 市区町村一覧を取得
 */
export async function getCitiesByPrefecture(
  prefectureCode: string,
): Promise<Array<{ name: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_boundaries")
    .select("city_name")
    .eq("prefecture_code", prefectureCode)
    .not("city_name", "is", null)
    .order("city_name", { ascending: true });

  if (error) {
    throw new Error(`市区町村一覧の取得に失敗しました: ${error.message}`);
  }

  // 重複を除去
  const uniqueCities = data?.reduce(
    (acc, item) => {
      if (item.city_name && !acc.find((c) => c.name === item.city_name)) {
        acc.push({ name: item.city_name });
      }
      return acc;
    },
    [] as Array<{ name: string }>,
  );

  return uniqueCities || [];
}

/**
 * 行政区域の件数を取得
 */
export async function getAdminBoundariesCount(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("admin_boundaries")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`行政区域件数の取得に失敗しました: ${error.message}`);
  }

  return count || 0;
}
