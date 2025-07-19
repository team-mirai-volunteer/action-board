import type { Tables } from "./supabase";

// ポスター掲示板の最小限のデータ型（マップ表示用）
export type PosterBoardMinimal = Pick<
  Tables<"poster_boards">,
  "id" | "lat" | "long" | "status" | "name" | "address" | "city" | "number"
>;
