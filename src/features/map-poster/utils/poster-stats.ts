import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

/**
 * 全ステータスの値が0のステータスカウントオブジェクトを生成する
 */
export function createEmptyStatusCounts(): Record<BoardStatus, number> {
  return {
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

/**
 * boards配列からstatus別のカウントを集計する
 */
export function countBoardsByStatus(
  boards: { status: BoardStatus }[],
): Record<BoardStatus, number> {
  const counts = createEmptyStatusCounts();
  for (const board of boards) {
    counts[board.status] += 1;
  }
  return counts;
}
