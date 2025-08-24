import { ProgressBarSimple } from "@/components/ui/progress-bar-simple";
import type { UserLevel } from "@/features/user-level/types/level-types";
import React from "react";

interface LevelProgressProps {
  userLevel: UserLevel | null;
}

export function LevelProgress({ userLevel }: LevelProgressProps) {
  const currentXp = userLevel?.xp ?? 0;

  return <ProgressBarSimple currentXp={currentXp} />;
}
