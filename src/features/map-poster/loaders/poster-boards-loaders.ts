"use server";

import { createClient } from "@/lib/supabase/client";
import {
  checkBoardMissionCompleted as checkBoardMissionCompletedService,
  getArchivedPosterBoardsMinimal as getArchivedPosterBoardsMinimalService,
  getPosterBoardDetail as getPosterBoardDetailService,
  getPosterBoardsMinimalByDistrict as getPosterBoardsMinimalByDistrictService,
  getPosterBoardsMinimal as getPosterBoardsMinimalService,
  getPosterMissionId as getPosterMissionIdService,
  POSTER_MISSION_SLUG,
} from "../services/poster-boards";

export { POSTER_MISSION_SLUG };

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
