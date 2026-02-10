"use server";

import type { GetMissionsFilterOptions } from "../services/missions";
import {
  getMissionAchievementCounts as getMissionAchievementCountsService,
  getMissionCategoryView as getMissionCategoryViewService,
  getMissionsForRanking as getMissionsForRankingService,
  getMissionsWithFilter as getMissionsWithFilterService,
  getPostingCountsForMissions as getPostingCountsForMissionsService,
  getTotalPostingCountByMission as getTotalPostingCountByMissionService,
  hasFeaturedMissions as hasFeaturedMissionsService,
} from "../services/missions";

export async function getMissionsForRanking() {
  return getMissionsForRankingService();
}

export async function hasFeaturedMissions() {
  return hasFeaturedMissionsService();
}

export async function getMissionAchievementCounts() {
  return getMissionAchievementCountsService();
}

export async function getTotalPostingCountByMission(
  missionId: string,
  seasonId?: string,
) {
  return getTotalPostingCountByMissionService(missionId, seasonId);
}

export async function getPostingCountsForMissions(
  missions: { id: string; required_artifact_type: string | null }[],
  seasonId?: string,
) {
  return getPostingCountsForMissionsService(missions, seasonId);
}

export async function getMissionsWithFilter(
  options?: GetMissionsFilterOptions,
) {
  return getMissionsWithFilterService(options);
}

export async function getMissionCategoryView() {
  return getMissionCategoryViewService();
}
