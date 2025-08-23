"use client";

import { cn, getLevelProgress, getXpToNextLevel } from "@/lib/utils/utils";
import React from "react";

interface ProgressBarSimpleProps {
  currentXp: number;
  className?: string;
  showText?: boolean;
}

export function ProgressBarSimple({
  currentXp,
  className,
  showText = true,
}: ProgressBarSimpleProps) {
  const xpToNextLevel = getXpToNextLevel(currentXp);
  const progressPercentage = getLevelProgress(currentXp) * 100;

  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="flex text-sm mb-2">
          <span>次のレベルまで</span>
          <span className="font-bold">
            {Math.round(xpToNextLevel).toLocaleString()}
            ポイント🔥
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
        <div
          className="bg-gradient-to-r from-[#30baa7] to-[#47c991] h-3 rounded-full shadow-sm"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
