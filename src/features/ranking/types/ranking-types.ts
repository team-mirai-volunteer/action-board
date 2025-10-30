/**
 * Ranking feature type definitions
 */
import type { PartyMembership } from "@/features/party-membership/types";

export type RankingPeriod = "all" | "daily";

export interface UserRanking {
  user_id: string | null;
  address_prefecture: string | null;
  level: number | null;
  name: string | null;
  rank: number | null;
  updated_at: string | null;
  xp: number | null;
  party_membership?: PartyMembership | null;
}

export interface UserMissionRanking extends UserRanking {
  user_achievement_count: number | null;
  total_points: number | null;
}
