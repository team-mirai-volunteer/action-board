export type { PeriodType } from "@/lib/utils/period-date-utils";
export {
  getPeriodEndDate,
  getPeriodStartDate,
  PERIOD_OPTIONS,
} from "@/lib/utils/period-date-utils";

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

export interface DailyActiveUsersItem {
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
