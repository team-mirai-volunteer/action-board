"use client";

import { markLevelUpSeenAction } from "@/app/actions/level-up";
import { LevelUpDialog } from "@/components/level-up-dialog";
import { useEffect, useState } from "react";

interface LevelUpCheckProps {
  levelUpData?: {
    previousLevel: number;
    newLevel: number;
    pointsToNextLevel: number;
  };
}

export function LevelUpCheck({ levelUpData }: LevelUpCheckProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (levelUpData) {
      // 少し待ってからダイアログを表示
      const timer = setTimeout(() => {
        setIsDialogOpen(true);
      }, 1000); // 1秒待つ

      return () => clearTimeout(timer);
    }
  }, [levelUpData]);

  const handleDialogClose = async () => {
    setIsDialogOpen(false);

    // Server Actionを呼び出して通知を確認済みとしてマーク
    try {
      const result = await markLevelUpSeenAction();
      if (!result.success) {
        console.error(
          "Failed to mark level up notification as seen:",
          result.error,
        );
      }
    } catch (error) {
      console.error("Error marking level up notification as seen:", error);
    }
  };

  if (!levelUpData) {
    return null;
  }

  return (
    <LevelUpDialog
      isOpen={isDialogOpen}
      onClose={handleDialogClose}
      newLevel={levelUpData.newLevel}
    />
  );
}
