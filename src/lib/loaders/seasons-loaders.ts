"use server";

import {
  getAllSeasons as getAllSeasonsService,
  getCurrentSeasonId as getCurrentSeasonIdService,
  getCurrentSeason as getCurrentSeasonService,
  getInactiveSeasons as getInactiveSeasonsService,
  getSeasonBySlug as getSeasonBySlugService,
  getUserSeasonHistory as getUserSeasonHistoryService,
} from "../services/seasons";

export async function getCurrentSeason() {
  return getCurrentSeasonService();
}

export async function getAllSeasons() {
  return getAllSeasonsService();
}

export async function getInactiveSeasons() {
  return getInactiveSeasonsService();
}

export async function getSeasonBySlug(slug: string) {
  return getSeasonBySlugService(slug);
}

export async function getCurrentSeasonId() {
  return getCurrentSeasonIdService();
}

export async function getUserSeasonHistory(userId: string) {
  return getUserSeasonHistoryService(userId);
}
