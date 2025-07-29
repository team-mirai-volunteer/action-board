"use client";

import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/types/supabase";
import { CheckCircle, Clock } from "lucide-react";
import React from "react";

type MissionAchievementStatusProps = {
  mission: Pick<Tables<"missions">, "max_achievement_count">;
  userAchievementCount: number;
};

export function MissionAchievementStatus({
  mission,
  userAchievementCount,
}: MissionAchievementStatusProps) {
  const maxAchievements = mission.max_achievement_count;
  const isCompleted =
    maxAchievements !== null && userAchievementCount >= maxAchievements;
  const canRepeat = maxAchievements === null || maxAchievements > 1;

  if (isCompleted) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        完了済み
      </Badge>
    );
  }

  if (userAchievementCount > 0 && canRepeat) {
    const progress = maxAchievements
      ? (userAchievementCount / maxAchievements) * 100
      : 0;

    return (
      <div className="space-y-2">
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          進行中 ({userAchievementCount}
          {maxAchievements ? `/${maxAchievements}` : ""})
        </Badge>
        {maxAchievements && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#30baa7] to-[#47c991] h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return <Badge variant="outline">未達成</Badge>;
}
