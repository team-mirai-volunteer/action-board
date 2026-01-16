"use server";

import { getGlobalActivityTimeline } from "@/features/user-activity/services/timeline";

export async function fetchMoreGlobalActivities(limit: number, offset: number) {
  return await getGlobalActivityTimeline(limit, offset);
}
