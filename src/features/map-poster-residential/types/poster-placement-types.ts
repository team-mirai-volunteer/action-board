import type { Database } from "@/lib/types/supabase";

/** poster_placements テーブルの行型 */
export type PosterPlacement =
  Database["public"]["Tables"]["poster_placements"]["Row"];

/** poster_placements テーブルの INSERT 型 */
export type PosterPlacementInsert =
  Database["public"]["Tables"]["poster_placements"]["Insert"];

/** poster_placements テーブルの UPDATE 型 */
export type PosterPlacementUpdate =
  Database["public"]["Tables"]["poster_placements"]["Update"];

/** poster_placement_city_stats ビューの行型 */
export type PosterPlacementCityStats =
  Database["public"]["Views"]["poster_placement_city_stats"]["Row"];
