import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

export const statusConfig: Record<
  BoardStatus,
  { label: string; color: string }
> = {
  not_yet: { label: "未着手", color: "bg-gray-500" },
  reserved: { label: "予約済み", color: "bg-yellow-500" },
  done: { label: "完了", color: "bg-green-500" },
  error_wrong_place: { label: "エラー：場所が違う", color: "bg-red-500" },
  error_damaged: { label: "エラー：破損", color: "bg-orange-500" },
  error_wrong_poster: { label: "エラー：ポスターが違う", color: "bg-red-700" },
  other: { label: "その他", color: "bg-purple-500" },
};
