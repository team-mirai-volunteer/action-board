"use server";

import {
  getActionStatsSummary as getActionStatsSummaryService,
  getDailyActionHistory as getDailyActionHistoryService,
  getDailyActiveUsersHistory as getDailyActiveUsersHistoryService,
  getMissionActionRanking as getMissionActionRankingService,
} from "../services/action-stats-service";

export async function getActionStatsSummary(startDate?: Date, endDate?: Date) {
  return getActionStatsSummaryService(startDate, endDate);
}

export async function getDailyActionHistory(startDate?: Date, endDate?: Date) {
  return getDailyActionHistoryService(startDate, endDate);
}

export async function getDailyActiveUsersHistory(
  startDate?: Date,
  endDate?: Date,
) {
  return getDailyActiveUsersHistoryService(startDate, endDate);
}

export async function getMissionActionRanking(
  startDate?: Date,
  endDate?: Date,
  limit?: number,
) {
  return getMissionActionRankingService(startDate, endDate, limit);
}
