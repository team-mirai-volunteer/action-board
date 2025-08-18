import { createAdminClient } from "@/lib/supabase/adminClient";
import type { UserBadge } from "../badge-types";
import { enrichMissionBadges } from "./helpers";

/**
 * 未通知のバッジを取得
 */
export async function getUnnotifiedBadges(
  userId: string,
): Promise<UserBadge[]> {
  const supabaseAdmin = await createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("user_badges")
    .select("*")
    .eq("user_id", userId)
    .eq("is_notified", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching unnotified badges:", error);
    return [];
  }

  const badges = (data || []) as UserBadge[];

  // ミッションバッジのタイトルを取得
  return enrichMissionBadges(badges);
}
