// 期間フィルター型はyoutube-statsから再利用
export type { PeriodType } from "@/features/youtube-stats/types";
export {
  PERIOD_OPTIONS,
  getPeriodEndDate,
  getPeriodStartDate,
} from "@/features/youtube-stats/types";

export interface ActionStatsSummary {
  totalActions: number;
  activeUsers: number;
  dailyActionsIncrease?: number;
  dailyUsersIncrease?: number;
}

export interface DailyActionItem {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface MissionActionRanking {
  missionId: string;
  missionTitle: string;
  missionSlug: string;
  iconUrl: string | null;
  actionCount: number;
  isHidden: boolean;
}
