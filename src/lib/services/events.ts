import "server-only";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

/**
 * イベント一覧を取得
 * @returns イベント配列（作成日時の降順）
 */
export async function getEvents(): Promise<Tables<"events">[]> {
  const supabase = createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return events ?? [];
}
