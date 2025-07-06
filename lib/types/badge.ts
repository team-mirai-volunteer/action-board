export type BadgeType = "DAILY" | "ALL" | "PREFECTURE" | "MISSION";

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  sub_type: string | null;
  rank: number;
  achieved_at: string;
  is_notified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BadgeUpdateParams {
  user_id: string;
  badge_type: BadgeType;
  sub_type: string | null;
  rank: number;
}

export interface BadgeNotification {
  badge: UserBadge;
  badgeTitle: string;
  badgeDescription: string;
}

export const getBadgeTitle = (badge: UserBadge): string => {
  switch (badge.badge_type) {
    case "DAILY":
      return `デイリーランキング ${badge.rank}位`;
    case "ALL":
      return `総合ランキング ${badge.rank}位`;
    case "PREFECTURE":
      return `${badge.sub_type}ランキング ${badge.rank}位`;
    case "MISSION":
      return `${badge.sub_type} ${badge.rank}位`;
    default:
      return `ランキング ${badge.rank}位`;
  }
};

export const getBadgeEmoji = (rank: number): string => {
  if (rank <= 10) return "🥇";
  if (rank <= 50) return "🥈";
  return "🥉";
};
