"use server";

import {
  getCurrentSeasonId as getCurrentSeasonIdService,
  getSeasonBySlug as getSeasonBySlugService,
  getUserSeasonHistory as getUserSeasonHistoryService,
} from "../services/seasons";

export async function getCurrentSeasonId() {
  return getCurrentSeasonIdService();
}

export async function getSeasonBySlug(slug: string) {
  return getSeasonBySlugService(slug);
}

export async function getUserSeasonHistory(userId: string) {
  return getUserSeasonHistoryService(userId);
}
