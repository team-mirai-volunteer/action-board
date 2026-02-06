"use server";

import { createClient } from "@/lib/supabase/client";
import { getSubmissionHistory as getSubmissionHistoryService } from "../services/mission-detail";

export async function getSubmissionHistory(missionId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");
  return getSubmissionHistoryService(user.id, missionId);
}
