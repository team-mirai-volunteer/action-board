"use server";

import {
  getCityDetail as getCityDetailService,
  getStatsByCity as getStatsByCityService,
  getUserPlacements as getUserPlacementsService,
} from "../services/poster-placements";

export async function loadMyPlacements(userId: string) {
  return getUserPlacementsService(userId);
}

export async function loadStatsByCity() {
  return getStatsByCityService();
}

export async function loadCityDetail(prefecture: string, city: string) {
  return getCityDetailService(prefecture, city);
}
