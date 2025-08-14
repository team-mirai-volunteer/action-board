import type { Database } from "@/lib/types/supabase";

export type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
export type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
export type PosterBoardTotal =
  Database["public"]["Tables"]["poster_board_totals"]["Row"];
export type StatusHistory =
  Database["public"]["Tables"]["poster_board_status_history"]["Row"] & {
    user?: { id: string; name: string; address_prefecture: string } | null;
  };

export interface BoardStats {
  totalCount: number;
  statusCounts: Record<BoardStatus, number>;
}
