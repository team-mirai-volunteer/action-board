"use server";

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
  userId: string,
  seasonId: string,
  period?: RankingPeriod,
) {
  return getUserPeriodRankingService(userId, seasonId, period);
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
  userId: string,
  seasonId?: string,
  period?: RankingPeriod,
) {
  return getUserMissionRankingService(missionId, userId, seasonId, period);
}

export async function getUserPostingCount(userId: string) {
  return getUserPostingCountService(userId);
}

export async function getUserPostingCountByMission(
  userId: string,
  missionId: string,
  seasonId?: string,
) {
  return getUserPostingCountByMissionService(userId, missionId, seasonId);
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
  userId: string,
  seasonId?: string,
  period?: RankingPeriod,
) {
  return getUserPrefecturesRankingService(prefecture, userId, seasonId, period);
}
