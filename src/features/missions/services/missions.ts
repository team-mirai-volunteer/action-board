import "server-only";

import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/types/supabase";

type Mission = Tables<"missions">;
type MissionCategory = Tables<"mission_category">;

export interface MissionWithCategory extends Mission {
  mission_category_link: {
    mission_category: Pick<
      MissionCategory,
      "id" | "category_title" | "sort_no"
    > | null;
  }[];
}

/**
 * ランキングページ用のミッション一覧を取得
 * - max_achievement_count が null のミッションのみ
 * - is_hidden が false のミッションのみ
 * - is_featured 優先、難易度昇順でソート
 */
export async function getMissionsForRanking(): Promise<MissionWithCategory[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("missions")
    .select(
      `
      *,
      mission_category_link(
        mission_category(
          id,
          category_title,
          sort_no
        )
      )
    `,
    )
    .is("max_achievement_count", null)
    .eq("is_hidden", false)
    .order("is_featured", { ascending: false })
    .order("difficulty", { ascending: true });

  if (error) {
    console.error("ミッション取得エラー:", error);
    throw error;
  }

  return (data ?? []) as MissionWithCategory[];
}

export async function hasFeaturedMissions(): Promise<boolean> {
  const supabase = createClient();
  const { count } = await supabase
    .from("missions")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true);

  return !!count;
}

/**
 * 全ミッションの達成人数を取得
 */
export async function getMissionAchievementCounts(): Promise<
  Map<string, number>
> {
  const supabase = createClient();

  const { data: achievementCounts, error } = await supabase
    .from("mission_achievement_count_view")
    .select("mission_id, achievement_count");

  if (error) {
    console.error("Error fetching mission achievement counts:", error);
    throw error;
  }

  const countMap = new Map<string, number>();
  for (const item of achievementCounts ?? []) {
    if (item.mission_id) {
      countMap.set(item.mission_id, item.achievement_count ?? 0);
    }
  }

  return countMap;
}
