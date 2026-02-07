"use server";

import {
  getPrefectureTeamRanking as getPrefectureTeamRankingService,
  getUserPrefectureContribution as getUserPrefectureContributionService,
} from "../services/get-prefecture-team-ranking";

export async function getPrefectureTeamRanking(seasonId?: string) {
  return getPrefectureTeamRankingService(seasonId);
}

export async function getUserPrefectureContribution(
  userId: string,
  seasonId?: string,
) {
  return getUserPrefectureContributionService(userId, seasonId);
}
