"use server";

import { completePostingMission as completePostingMissionService } from "../services/posting-mission";

export async function completePostingMission(
  shapeId: string,
  postingCount: number,
  locationText?: string,
) {
  return completePostingMissionService(shapeId, postingCount, locationText);
}
