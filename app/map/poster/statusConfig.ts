import type { Database } from "@/lib/types/supabase";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

export const statusConfig: Record<
  BoardStatus,
  { label: string; color: string }
> = {
  not_yet: { label: "未貼付", color: "bg-gray-500" },
  reserved: { label: "予約", color: "bg-yellow-500" },
  done: { label: "完了", color: "bg-green-500" },
  error_wrong_place: {
    label: "エラー（ポスター掲示板マップと実際の場所・番号が違う）",
    color: "bg-red-500",
  },
  error_damaged: { label: "エラー（損傷・破損）", color: "bg-orange-500" },
  error_wrong_poster: {
    label: "エラー（他党のポスターが貼られている）",
    color: "bg-red-700",
  },
  other: { label: "その他（詳細をメモに記載）", color: "bg-purple-500" },
};
