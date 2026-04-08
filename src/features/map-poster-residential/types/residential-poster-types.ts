import type { Database } from "@/lib/types/supabase";

/** residential_poster_placements テーブルの行型 */
export type ResidentialPosterPlacement =
  Database["public"]["Tables"]["residential_poster_placements"]["Row"];

/** residential_poster_placements テーブルの INSERT 型 */
export type ResidentialPosterPlacementInsert =
  Database["public"]["Tables"]["residential_poster_placements"]["Insert"];

/** residential_poster_placements テーブルの UPDATE 型 */
export type ResidentialPosterPlacementUpdate =
  Database["public"]["Tables"]["residential_poster_placements"]["Update"];

/** residential_poster_city_stats ビューの行型 */
export type ResidentialPosterCityStats =
  Database["public"]["Views"]["residential_poster_city_stats"]["Row"];
