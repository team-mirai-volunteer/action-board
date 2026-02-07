"use server";

import {
  getGlobalActivityTimelineCount as getGlobalActivityTimelineCountService,
  getGlobalActivityTimeline as getGlobalActivityTimelineService,
  getUserActivityTimelineCount as getUserActivityTimelineCountService,
  getUserActivityTimeline as getUserActivityTimelineService,
} from "../services/timeline";

export async function getUserActivityTimeline(
  userId: string,
  limit?: number,
  offset?: number,
  seasonId?: string,
) {
  return getUserActivityTimelineService(userId, limit, offset, seasonId);
}

export async function getUserActivityTimelineCount(
  userId: string,
  seasonId?: string,
) {
  return getUserActivityTimelineCountService(userId, seasonId);
}

export async function getGlobalActivityTimeline(
  limit: number,
  offset?: number,
) {
  return getGlobalActivityTimelineService(limit, offset);
}

export async function getGlobalActivityTimelineCount() {
  return getGlobalActivityTimelineCountService();
}
