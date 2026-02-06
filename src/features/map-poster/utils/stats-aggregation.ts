import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type PrefectureStats = Record<string, Record<BoardStatus, number>>;

/**
 * RPC結果の行の型
 */
export interface BoardStatsRow {
  prefecture: string;
  status: string;
  count: number;
}

const EMPTY_STATUS_RECORD: Record<BoardStatus, number> = {
  not_yet: 0,
  not_yet_dangerous: 0,
  reserved: 0,
  done: 0,
  error_wrong_place: 0,
  error_damaged: 0,
  error_wrong_poster: 0,
  other: 0,
};

/**
 * ボード統計データの行配列を都道府県×ステータス別に集計する
 */
export function aggregateBoardStats(data: BoardStatsRow[]): {
  stats: PrefectureStats;
  total: number;
  completed: number;
} {
  const stats: PrefectureStats = {};
  let total = 0;
  let completed = 0;

  for (const row of data) {
    if (!stats[row.prefecture]) {
      stats[row.prefecture] = { ...EMPTY_STATUS_RECORD };
    }
    stats[row.prefecture][row.status as BoardStatus] = row.count;
    total += row.count;
    if (row.status === "done") {
      completed += row.count;
    }
  }

  return { stats, total, completed };
}

/**
 * 個別ボードの配列を都道府県×ステータス別に集計する（フォールバック用）
 */
export function aggregateBoardsByPrefecture(
  boards: { prefecture: string; status: BoardStatus }[],
): {
  stats: PrefectureStats;
  total: number;
  completed: number;
} {
  const stats: PrefectureStats = {};
  let total = 0;
  let completed = 0;

  for (const board of boards) {
    if (!stats[board.prefecture]) {
      stats[board.prefecture] = { ...EMPTY_STATUS_RECORD };
    }
    stats[board.prefecture][board.status]++;
    total++;
    if (board.status === "done") {
      completed++;
    }
  }

  return { stats, total, completed };
}
