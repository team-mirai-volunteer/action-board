import { createAdminClient } from "@/lib/supabase/adminClient";
import type { UserBadge } from "../badge-types";
import { enrichMissionBadges } from "./helpers";

/**
 * ユーザーの現在のバッジを取得（ミッション情報付き）
 */
export async function getUserBadges(
  userId: string,
  seasonId?: string,
): Promise<UserBadge[]> {
  const supabaseAdmin = await createAdminClient();

  let query = supabaseAdmin
    .from("user_badges")
    .select("*")
    .eq("user_id", userId);

  // seasonIdが指定された場合はそのシーズンのバッジのみ取得
  if (seasonId) {
    query = query.eq("season_id", seasonId);
  }

  const { data, error } = await query.order("badge_type").order("rank");

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  const badges = (data || []) as UserBadge[];

  // ミッションバッジのタイトルを取得
  return enrichMissionBadges(badges);
}
