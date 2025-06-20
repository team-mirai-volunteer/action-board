import { createClient } from "@/lib/supabase/client";
import type { PinData } from "@/lib/types/poster-map";

//【修正点】action-boardの作法に合わせ、型引数なしでcreateClientを呼び出す
const supabase = createClient();

export async function getBoardPins(
  prefecture: string | null,
): Promise<PinData[]> {
  const query = supabase
    .from("pins")
    .select("*, cities!inner(prefecture, city)");

  const { data, error } = await (prefecture
    ? query.filter("cities.prefecture", "eq", prefecture)
    : query);

  if (error) {
    throw error;
  }
  if (!data) return [];

  const formattedData = data.map((pin) => ({
    ...pin,
    // citiesが配列で返ってくることを考慮し、最初の要素を取り出す
    cities: Array.isArray(pin.cities) ? pin.cities[0] : pin.cities,
  }));

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
