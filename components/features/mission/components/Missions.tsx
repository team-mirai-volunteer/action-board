"use client";

import type { Tables } from "@/lib/types/supabase";
import React from "react";
import Mission from "./Mission";

type MissionsProps = {
  missions: Tables<"missions">[];
  userAchievements?: Record<string, number>;
  totalAchievements?: Record<string, number>;
  className?: string;
};

export default function Missions({
  missions,
  userAchievements = {},
  totalAchievements = {},
  className = "",
}: MissionsProps) {
  if (missions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        ミッションがありません
      </div>
    );
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {missions.map((mission) => (
        <Mission
          key={mission.id}
          mission={mission}
          userAchievementCount={userAchievements[mission.id] || 0}
          totalAchievementCount={totalAchievements[mission.id] || 0}
        />
      ))}
    </div>
  );
}
