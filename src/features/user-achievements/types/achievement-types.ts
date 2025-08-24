export interface MissionAchievementSummary {
  mission_id: string;
  mission_title: string;
  achievement_count: number;
}

export interface UserAchievementsProps {
  userId: string;
  seasonId?: string;
}

export interface MissionCardProps {
  missionId: string;
  missionTitle: string;
  achievementCount: number;
}

export interface TotalCardProps {
  totalCount: number;
}
