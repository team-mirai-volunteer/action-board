"use server";

import { getUser } from "@/features/user-profile/services/profile";
import { getAuth } from "@/lib/supabase/client";
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
} from "../services/mission-detail";

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

export async function getUserAchievements(missionId: string) {
  const user = await getUser();
  if (!user) throw new Error("認証が必要です");
  return getUserAchievementsService(user.id, missionId);
}

export async function getSubmissionHistory(missionId: string, limit?: number) {
  const {
    data: { user },
  } = await getAuth().getUser();
  if (!user) throw new Error("認証が必要です");
  return getSubmissionHistoryService(user.id, missionId, limit);
}

export async function getMissionMainLink(missionId: string) {
  return getMissionMainLinkService(missionId);
}

export async function getMissionPageData(identifier: string) {
  const user = await getUser();
  return getMissionPageDataService(identifier, user?.id);
}

export async function getReferralCode() {
  const user = await getUser();
  if (!user) throw new Error("認証が必要です");
  return getReferralCodeService(user.id);
}
