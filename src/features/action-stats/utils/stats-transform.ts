import type { ActionStatsSummary, MissionActionRanking } from "../types";

/**
 * RPC結果をActionStatsSummary型に変換する
 */
export function transformActionStatsResult(
  result:
    | {
        total_actions?: number | string | null;
        active_users?: number | string | null;
        daily_actions_increase?: number | string | null;
        daily_users_increase?: number | string | null;
      }
    | undefined
    | null,
): ActionStatsSummary {
  return {
    totalActions: Number(result?.total_actions ?? 0),
    activeUsers: Number(result?.active_users ?? 0),
    dailyActionsIncrease: Number(result?.daily_actions_increase ?? 0),
    dailyUsersIncrease: Number(result?.daily_users_increase ?? 0),
  };
}

/**
 * RPC結果のミッション別ランキングデータをMissionActionRanking型に変換する
 */
export interface RawMissionRankingItem {
  mission_id: string;
  mission_title: string;
  mission_slug: string;
  icon_url: string | null;
  action_count: number;
  is_hidden: boolean;
}

export function mapMissionRankingResults(
  data: RawMissionRankingItem[],
): MissionActionRanking[] {
  return data.map((item) => ({
    missionId: item.mission_id,
    missionTitle: item.mission_title,
    missionSlug: item.mission_slug,
    iconUrl: item.icon_url,
    actionCount: Number(item.action_count),
    isHidden: item.is_hidden,
  }));
}
