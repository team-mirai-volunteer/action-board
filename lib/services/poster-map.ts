// lib/services/poster-map.ts

import { createClient as createClientClient } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import type { PinData, UpdatePinRequest } from "@/lib/types/poster-map";

export async function getBoardPins(
  prefecture: string | null,
): Promise<PinData[]> {
  if (!prefecture) {
    return [];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pins")
      .select(
        "id, number, address, place_name, lat, long, status, note, created_at, cities!inner(prefecture, city)",
      )
      .eq("cities.prefecture", prefecture);

    if (error) {
      console.error("Error loading poster pins:", error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.error("Error in getBoardPins function:", error);
    return [];
  }
}

export async function updatePin(
  request: UpdatePinRequest,
): Promise<PinData | null> {
  try {
    const supabase = createClientClient();
    const { data, error } = await supabase
      .from("pins")
      .update({
        status: request.status,
        note: request.note,
      })
      .eq("id", request.id) // request.idは数値なので変換不要
      .select("*, cities(*)")
      .single();

    if (error) {
      console.error("Error updating pin:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error in updatePin function:", error);
    return null;
  }
}
