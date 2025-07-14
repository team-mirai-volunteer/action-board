import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";

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

  // Transform the data into our expected format
  const stats: PrefectureStats = {};
  let total = 0;
  let completed = 0;

  if (data && Array.isArray(data)) {
    for (const row of data) {
      if (!stats[row.prefecture]) {
        stats[row.prefecture] = {
          not_yet: 0,
          not_yet_dangerous: 0,
          reserved: 0,
          done: 0,
          error_wrong_place: 0,
          error_damaged: 0,
          error_wrong_poster: 0,
          other: 0,
        };
      }
      stats[row.prefecture][row.status as BoardStatus] = row.count;
      total += row.count;
      if (row.status === "done") {
        completed += row.count;
      }
    }
  }

  return { stats, total, completed };
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

  // Calculate statistics
  const stats: PrefectureStats = {};
  let total = 0;
  let completed = 0;

  for (const board of allBoards) {
    if (!stats[board.prefecture]) {
      stats[board.prefecture] = {
        not_yet: 0,
        not_yet_dangerous: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };
    }
    stats[board.prefecture][board.status]++;
    total++;
    if (board.status === "done") {
      completed++;
    }
  }

  return { stats, total, completed };
}
