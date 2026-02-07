"use server";

import { getUser } from "@/features/user-profile/services/profile";
import {
  getPrefectureTeamRanking as getPrefectureTeamRankingService,
  getUserPrefectureContribution as getUserPrefectureContributionService,
} from "../services/get-prefecture-team-ranking";

export async function getPrefectureTeamRanking(seasonId?: string) {
  return getPrefectureTeamRankingService(seasonId);
}

export async function getUserPrefectureContribution(seasonId?: string) {
  const user = await getUser();
  if (!user) return null;
  return getUserPrefectureContributionService(user.id, seasonId);
}
