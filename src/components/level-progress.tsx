import type { UserLevel } from "@/lib/services/userLevel";
import React from "react";
import { ProgressBarSimple } from "./ui/progress-bar-simple";

interface LevelProgressProps {
  userLevel: UserLevel | null;
}

export function LevelProgress({ userLevel }: LevelProgressProps) {
  const currentXp = userLevel?.xp ?? 0;

  return <ProgressBarSimple currentXp={currentXp} />;
}
