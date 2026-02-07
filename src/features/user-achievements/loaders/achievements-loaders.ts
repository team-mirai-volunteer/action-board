"use server";

import {
  getUserMissionAchievements as getUserMissionAchievementsService,
  getUserRepeatableMissionAchievements as getUserRepeatableMissionAchievementsService,
} from "../services/achievements";

export async function getUserRepeatableMissionAchievements(
  userId: string,
  seasonId?: string,
) {
  return getUserRepeatableMissionAchievementsService(userId, seasonId);
}

export async function getUserMissionAchievements(userId: string) {
  return getUserMissionAchievementsService(userId);
}
