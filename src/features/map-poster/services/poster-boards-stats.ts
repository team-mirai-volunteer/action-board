import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import {
  aggregateBoardStats,
  aggregateBoardsByPrefecture,
} from "../utils/stats-aggregation";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type PrefectureStats = Record<string, Record<BoardStatus, number>>;

export async function getPosterBoardStats(): Promise<{
  stats: PrefectureStats;
  total: number;
  completed: number;
}> {
  const supabase = createClient();

  // Use SQL aggregation for much faster performance
  const { data, error } = await supabase.rpc("get_poster_board_stats");

  if (error) {
    console.error("Error fetching poster board stats:", error);
    // Fallback to manual calculation if RPC doesn't exist
    return getFallbackStats();
  }

  if (data && Array.isArray(data)) {
    return aggregateBoardStats(data);
  }

  return { stats: {}, total: 0, completed: 0 };
}

// Fallback function that fetches minimal data
async function getFallbackStats(): Promise<{
  stats: PrefectureStats;
  total: number;
  completed: number;
}> {
  const supabase = createClient();

  // Fetch only necessary fields with pagination
  let allBoards: { prefecture: string; status: BoardStatus }[] = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("poster_boards")
      .select("prefecture, status")
      .not("lat", "is", null)
      .not("long", "is", null)
      .eq("archived", false)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching poster boards:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    allBoards = [...allBoards, ...data];

    if (data.length < pageSize) {
      break;
    }

    page++;
  }

  return aggregateBoardsByPrefecture(allBoards);
}
