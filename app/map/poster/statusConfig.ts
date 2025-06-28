import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

export const statusConfig: Record<
  BoardStatus,
  { label: string; color: string }
> = {
  not_yet: { label: "未貼付", color: "bg-gray-500" },
  reserved: { label: "予約", color: "bg-yellow-500" },
  posted: { label: "貼付済", color: "bg-green-500" },
  checked: { label: "確認済", color: "bg-blue-500" },
  damaged: { label: "損傷", color: "bg-red-500" },
  error: { label: "エラー", color: "bg-red-700" },
  other: { label: "その他", color: "bg-purple-500" },
};
