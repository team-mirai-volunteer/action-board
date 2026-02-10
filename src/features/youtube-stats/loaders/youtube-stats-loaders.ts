"use server";

import {
  getOverallStatsHistory as getOverallStatsHistoryService,
  getVideoCountByDate as getVideoCountByDateService,
  getYouTubeStatsSummary as getYouTubeStatsSummaryService,
  getYouTubeVideoCount as getYouTubeVideoCountService,
  getYouTubeVideosWithStats as getYouTubeVideosWithStatsService,
} from "../services/youtube-stats-service";
import type { SortType } from "../types";

export async function getYouTubeVideosWithStats(
  limit: number,
  offset: number,
  sortBy: SortType,
  startDate?: Date,
  endDate?: Date,
) {
  return getYouTubeVideosWithStatsService(
    limit,
    offset,
    sortBy,
    startDate,
    endDate,
  );
}

export async function getYouTubeVideoCount(startDate?: Date, endDate?: Date) {
  return getYouTubeVideoCountService(startDate, endDate);
}

export async function getYouTubeStatsSummary(startDate?: Date, endDate?: Date) {
  return getYouTubeStatsSummaryService(startDate, endDate);
}

export async function getOverallStatsHistory(startDate?: Date, endDate?: Date) {
  return getOverallStatsHistoryService(startDate, endDate);
}

export async function getVideoCountByDate(startDate?: Date, endDate?: Date) {
  return getVideoCountByDateService(startDate, endDate);
}
