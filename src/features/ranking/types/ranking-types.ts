/**
 * Ranking feature type definitions
 */

export type RankingPeriod = "all" | "daily";

export interface UserRanking {
  user_id: string | null;
  address_prefecture: string | null;
  level: number | null;
  name: string | null;
  rank: number | null;
  updated_at: string | null;
  xp: number | null;
}

export interface UserMissionRanking extends UserRanking {
  user_achievement_count: number | null;
  total_points: number | null;
}

export interface PrefectureRanking {
  prefecture: string;
  total_xp: number;
  user_count: number;
  rank: number;
}

export interface CurrentUserRanking {
  user_id: string;
  name: string | null;
  address_prefecture: string | null;
  rank: number | null;
  xp?: number | null;
  user_achievement_count?: number | null;
}
