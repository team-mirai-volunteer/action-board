"use server";

import {
  getMissionData as getMissionDataService,
  getMissionIdBySlug as getMissionIdBySlugService,
  getMissionMainLink as getMissionMainLinkService,
  getMissionPageData as getMissionPageDataService,
  getMissionSlugById as getMissionSlugByIdService,
  getReferralCode as getReferralCodeService,
  getSubmissionHistory as getSubmissionHistoryService,
  getTotalAchievementCount as getTotalAchievementCountService,
  getUserAchievements as getUserAchievementsService,
  isUUID,
} from "../services/mission-detail";

export { isUUID };

export async function getMissionData(identifier: string) {
  return getMissionDataService(identifier);
}

export async function getMissionIdBySlug(slug: string) {
  return getMissionIdBySlugService(slug);
}

export async function getMissionSlugById(id: string) {
  return getMissionSlugByIdService(id);
}

export async function getTotalAchievementCount(missionId: string) {
  return getTotalAchievementCountService(missionId);
}

export async function getUserAchievements(userId: string, missionId: string) {
  return getUserAchievementsService(userId, missionId);
}

export async function getSubmissionHistory(userId: string, missionId: string) {
  return getSubmissionHistoryService(userId, missionId);
}

export async function getMissionMainLink(missionId: string) {
  return getMissionMainLinkService(missionId);
}

export async function getMissionPageData(identifier: string, userId?: string) {
  return getMissionPageDataService(identifier, userId);
}

export async function getReferralCode(userId: string) {
  return getReferralCodeService(userId);
}
