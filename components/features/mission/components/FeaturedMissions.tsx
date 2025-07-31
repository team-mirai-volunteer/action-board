"use client";

import type { Tables } from "@/lib/types/supabase";
import React from "react";
import Missions from "./Missions";

type FeaturedMissionsProps = {
  missions: Tables<"missions">[];
  userAchievements?: Record<string, number>;
  totalAchievements?: Record<string, number>;
};

export function FeaturedMissions({
  missions,
  userAchievements,
  totalAchievements,
}: FeaturedMissionsProps) {
  const featuredMissions = missions.filter((mission) => mission.is_featured);

  if (featuredMissions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">重要ミッション</h2>
      <Missions
        missions={featuredMissions}
        userAchievements={userAchievements}
        totalAchievements={totalAchievements}
      />
    </div>
  );
}
