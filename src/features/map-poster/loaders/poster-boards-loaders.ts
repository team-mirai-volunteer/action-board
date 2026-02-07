"use server";

import { createClient } from "@/lib/supabase/client";
import {
  checkBoardMissionCompleted as checkBoardMissionCompletedService,
  getArchivedPosterBoardStats as getArchivedPosterBoardStatsService,
  getArchivedPosterBoardSummary as getArchivedPosterBoardSummaryService,
  getArchivedPosterBoardsMinimal as getArchivedPosterBoardsMinimalService,
  getDistrictsWithBoards as getDistrictsWithBoardsService,
  getPosterBoardDetail as getPosterBoardDetailService,
  getPosterBoardSummaryByDistrict as getPosterBoardSummaryByDistrictService,
  getPosterBoardsMinimalByDistrict as getPosterBoardsMinimalByDistrictService,
  getPosterBoardsMinimal as getPosterBoardsMinimalService,
  getPosterMissionId as getPosterMissionIdService,
} from "../services/poster-boards";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getPosterBoardsMinimal(prefecture?: string) {
  return getPosterBoardsMinimalService(prefecture);
}

export async function getPosterBoardsMinimalByDistrict(district: string) {
  return getPosterBoardsMinimalByDistrictService(district);
}

export async function getPosterBoardDetail(boardId: string) {
  return getPosterBoardDetailService(boardId);
}

export async function getArchivedPosterBoardsMinimal(
  electionTerm: string,
  prefecture: string,
) {
  return getArchivedPosterBoardsMinimalService(electionTerm, prefecture);
}

export async function getPosterMissionId() {
  return getPosterMissionIdService();
}

export async function checkBoardMissionCompleted(
  boardId: string,
  userId: string,
) {
  return checkBoardMissionCompletedService(boardId, userId);
}

export async function getPosterBoardSummaryByDistrict() {
  return getPosterBoardSummaryByDistrictService();
}

export async function getDistrictsWithBoards() {
  return getDistrictsWithBoardsService();
}

export async function getArchivedPosterBoardSummary(electionTerm: string) {
  return getArchivedPosterBoardSummaryService(electionTerm);
}

export async function getArchivedPosterBoardStats(
  electionTerm: string,
  prefecture: string,
) {
  return getArchivedPosterBoardStatsService(electionTerm, prefecture);
}
