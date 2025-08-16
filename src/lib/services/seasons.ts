import { createAdminClient } from "@/lib/supabase/adminClient";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

type Season = Database["public"]["Tables"]["seasons"]["Row"];
export type { Season };

export async function getCurrentSeason(): Promise<Season | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching current season:", error);
    return null;
  }

  return data;
}

export async function getAllSeasons(): Promise<Season[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("is_active", { ascending: false })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }

  return data || [];
}

export async function getInactiveSeasons(): Promise<Season[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", false)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }

  return data || [];
}

export async function getSeasonBySlug(slug: string): Promise<Season | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching season by slug:", error);
    return null;
  }

  return data;
}

export async function getCurrentSeasonId(): Promise<string | null> {
  const currentSeason = await getCurrentSeason();
  return currentSeason?.id || null;
}

/**
 * ユーザーのシーズン履歴（レベル情報付き）を取得
 */
export async function getUserSeasonHistory(userId: string): Promise<
  Array<{
    season: Season;
    userLevel: {
      level: number;
      xp: number;
      updated_at: string;
    } | null;
  }>
> {
  const supabase = await createAdminClient();

  // 全シーズンを取得（アクティブなシーズンを最初に、その後は開始日の降順）
  const { data: seasons, error: seasonsError } = await supabase
    .from("seasons")
    .select("*")
    .order("is_active", { ascending: false })
    .order("start_date", { ascending: false });

  if (seasonsError) {
    console.error("Failed to fetch seasons:", seasonsError);
    return [];
  }

  if (!seasons) {
    return [];
  }

  // 各シーズンでのユーザーレベル情報を取得
  const seasonHistory = await Promise.all(
    seasons.map(async (season) => {
      const { data: userLevel } = await supabase
        .from("user_levels")
        .select("level, xp, updated_at")
        .eq("user_id", userId)
        .eq("season_id", season.id)
        .single();

      return {
        season,
        userLevel,
      };
    }),
  );

  // レベル情報があるシーズンのみを返す
  return seasonHistory.filter((item) => item.userLevel !== null);
}
