"use server";

import { getUser } from "@/features/user-profile/services/profile";
import {
  getMissionRanking as getMissionRankingService,
  getTopUsersPostingCountByMission as getTopUsersPostingCountByMissionService,
  getTopUsersPostingCount as getTopUsersPostingCountService,
  getUserMissionRanking as getUserMissionRankingService,
  getUserPostingCountByMission as getUserPostingCountByMissionService,
  getUserPostingCount as getUserPostingCountService,
} from "../services/get-missions-ranking";
import {
  getPrefecturesRanking as getPrefecturesRankingService,
  getUserPrefecturesRanking as getUserPrefecturesRankingService,
} from "../services/get-prefectures-ranking";
import {
  getRanking as getRankingService,
  getUserPeriodRanking as getUserPeriodRankingService,
} from "../services/get-ranking";
import type { RankingPeriod } from "../types/ranking-types";

export async function getUserPeriodRanking(
  seasonId: string,
  period?: RankingPeriod,
) {
  const user = await getUser();
  if (!user) return null;
  return getUserPeriodRankingService(user.id, seasonId, period);
}

export async function getRanking(
  limit?: number,
  period?: RankingPeriod,
  seasonId?: string,
) {
  return getRankingService(limit, period, seasonId);
}

export async function getMissionRanking(
  missionId: string,
  limit?: number,
  period?: RankingPeriod,
  seasonId?: string,
) {
  return getMissionRankingService(missionId, limit, period, seasonId);
}

export async function getUserMissionRanking(
  missionId: string,
  seasonId?: string,
  period?: RankingPeriod,
) {
  const user = await getUser();
  if (!user) return null;
  return getUserMissionRankingService(missionId, user.id, seasonId, period);
}

export async function getUserPostingCount() {
  const user = await getUser();
  if (!user) return 0;
  return getUserPostingCountService(user.id);
}

export async function getUserPostingCountByMission(
  missionId: string,
  seasonId?: string,
) {
  const user = await getUser();
  if (!user) return 0;
  return getUserPostingCountByMissionService(user.id, missionId, seasonId);
}

export async function getTopUsersPostingCount(userIds: string[]) {
  return getTopUsersPostingCountService(userIds);
}

export async function getTopUsersPostingCountByMission(
  userIds: string[],
  missionId: string,
  seasonId?: string,
) {
  return getTopUsersPostingCountByMissionService(userIds, missionId, seasonId);
}

export async function getPrefecturesRanking(
  prefecture: string,
  limit?: number,
  period?: RankingPeriod,
  seasonId?: string,
) {
  return getPrefecturesRankingService(prefecture, limit, period, seasonId);
}

export async function getUserPrefecturesRanking(
  prefecture: string,
  seasonId?: string,
  period?: RankingPeriod,
) {
  const user = await getUser();
  if (!user) return null;
  return getUserPrefecturesRankingService(
    prefecture,
    user.id,
    seasonId,
    period,
  );
}
