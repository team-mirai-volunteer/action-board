import type { Season } from "@/lib/services/seasons";

interface UserSeasonHistoryItem {
  season: Season;
  userLevel: {
    level: number;
    xp: number;
    updated_at: string;
  } | null;
}

export interface UserSeasonHeaderProps {
  season: Season;
  userId: string;
}

export interface UserSeasonHistoryProps {
  userId: string;
  seasonHistory: UserSeasonHistoryItem[];
}
