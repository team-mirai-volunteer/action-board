import { createAdminClient } from "@/lib/supabase/adminClient";
import type { UserBadge } from "../badge-types";
import { mapMissionDataToBadges } from "../utils/badge-enrichment";

/**
 * ミッションバッジにタイトル情報を追加する
 */
export async function enrichMissionBadges(
  badges: UserBadge[],
): Promise<UserBadge[]> {
  // ミッションタイプのバッジのミッションslugを収集
  const missionSlugs = badges
    .filter((badge) => badge.badge_type === "MISSION" && badge.sub_type)
    .map((badge) => badge.sub_type as string);

  if (missionSlugs.length === 0) {
    return badges;
  }

  const supabaseAdmin = await createAdminClient();

  // ミッション情報を取得（IDも含める）
  const { data: missions, error: missionError } = await supabaseAdmin
    .from("missions")
    .select("id, slug, title")
    .in("slug", missionSlugs);

  if (missionError || !missions) {
    console.error("Error fetching mission titles:", missionError);
    return badges;
  }

  // ミッションslugとミッション情報のマップを作成
  const missionMap = new Map(
    missions.map((m) => [m.slug, { id: m.id, title: m.title }]),
  );

  return mapMissionDataToBadges(badges, missionMap);
}
