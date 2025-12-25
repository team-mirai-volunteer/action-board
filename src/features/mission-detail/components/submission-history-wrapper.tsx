"use client";

import SubmissionHistory from "@/features/mission-detail/components/submission-history";
import type { SubmissionData } from "@/features/mission-detail/types/detail-types";

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
