"use client";

import { useDailyAttemptStatus } from "@/app/missions/[id]/_hooks/useMissionSubmission";

interface DailyAttemptStatusProps {
  missionId: string;
  userId: string | null;
  className?: string;
}

export function DailyAttemptStatus({
  missionId,
  userId,
  className,
}: DailyAttemptStatusProps) {
  const dailyAttemptStatus = useDailyAttemptStatus(missionId, userId);

  if (dailyAttemptStatus.dailyLimit === null) {
    return null;
  }

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">
        今日の挑戦回数: {dailyAttemptStatus.currentAttempts}/
        {dailyAttemptStatus.dailyLimit}
        {dailyAttemptStatus.hasReachedLimit && (
          <span className="text-destructive ml-1">(上限に達しました)</span>
        )}
      </p>
    </div>
  );
}
