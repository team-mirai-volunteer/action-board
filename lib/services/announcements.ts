import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

/**
 * 有効なお知らせを取得する
 */
export async function getActiveAnnouncements(): Promise<{
  success: boolean;
  announcements?: Announcement[];
  error?: string;
}> {
  const supabase = await createServiceClient();

  try {
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .or("start_date.is.null,start_date.lte.now()")
      .or("end_date.is.null,end_date.gte.now()")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch announcements:", error);
      return { success: false, error: "お知らせの取得に失敗しました" };
    }

    return { success: true, announcements: announcements || [] };
  } catch (error) {
    console.error("Error in getActiveAnnouncements:", error);
    return { success: false, error: "予期しないエラーが発生しました" };
  }
}
