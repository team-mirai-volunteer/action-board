import { createClient } from "@/lib/supabase/client";
import type { PinData } from "@/lib/types/poster-map";

const supabase = createClient();

export async function getBoardPins(
  prefecture: string | null,
): Promise<PinData[]> {
  // supabase.fromの引数は、型定義ファイルに追加したテーブル名なので、型安全にアクセスできる
  let query = supabase.from("pins").select("*, cities!inner(prefecture, city)");

  if (prefecture) {
    query = query.filter("cities.prefecture", "eq", prefecture);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }
  if (!data) return [];

  const formattedData = data.map((pin) => ({
    ...pin,
    // citiesが配列で返ってくることを考慮し、最初の要素を取り出す
    cities: Array.isArray(pin.cities) ? pin.cities[0] : pin.cities,
  }));

  // APIの返り値の型を、私たちの定義したPinDataに合わせる
  return formattedData as unknown as PinData[];
}

export async function updatePin(
  id: number,
  status: number,
  note: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from("pins")
    .update({ status, note, updated_by: userId })
    .eq("id", id)
    .select("*, cities!inner(prefecture, city)")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
