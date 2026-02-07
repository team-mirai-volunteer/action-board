"use server";

import {
  getOverallStatsHistory as getOverallStatsHistoryService,
  getTikTokStatsSummary as getTikTokStatsSummaryService,
  getTikTokVideoCount as getTikTokVideoCountService,
  getTikTokVideosWithStats as getTikTokVideosWithStatsService,
  getVideoCountByDate as getVideoCountByDateService,
} from "../services/tiktok-stats-service";
import type { SortType } from "../types";

export async function getTikTokVideosWithStats(
  limit: number,
  offset: number,
  sortBy: SortType,
  startDate?: Date,
  endDate?: Date,
) {
  return getTikTokVideosWithStatsService(
    limit,
    offset,
    sortBy,
    startDate,
    endDate,
  );
}

export async function getTikTokVideoCount(startDate?: Date, endDate?: Date) {
  return getTikTokVideoCountService(startDate, endDate);
}

export async function getTikTokStatsSummary(startDate?: Date, endDate?: Date) {
  return getTikTokStatsSummaryService(startDate, endDate);
}

export async function getOverallStatsHistory(startDate?: Date, endDate?: Date) {
  return getOverallStatsHistoryService(startDate, endDate);
}

export async function getVideoCountByDate(startDate?: Date, endDate?: Date) {
  return getVideoCountByDateService(startDate, endDate);
}
