"use client";

import type { SubmissionData } from "../_lib/types";
import SubmissionHistory from "./SubmissionHistory";

type Props = {
  submissions: SubmissionData[];
  missionId: string;
  userId?: string | null;
  maxAchievementCount: number;
};

export function SubmissionHistoryWrapper({
  submissions,
  missionId,
  userId,
  maxAchievementCount,
}: Props) {
  if (submissions.length === 0) {
    return null;
  }

  return (
    <SubmissionHistory
      submissions={submissions.map((sub) => ({
        ...sub,
        mission_id: sub.mission_id || "",
        user_id: sub.user_id || "",
        season_id: sub.season_id || "",
      }))}
      missionId={missionId}
      userId={userId}
      maxAchievementCount={maxAchievementCount}
    />
  );
}
