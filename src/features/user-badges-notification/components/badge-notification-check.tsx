"use client";

import { useEffect, useState } from "react";
import type { UserBadge } from "@/features/user-badges/badge-types";
import { markBadgeNotificationAsSeenAction } from "@/features/user-badges-notification/badge-notification-action";
import { BadgeNotificationDialog } from "@/features/user-badges-notification/components/badge-notification-dialog";

interface BadgeNotificationCheckProps {
  badgeData?: UserBadge[];
}

export function BadgeNotificationCheck({
  badgeData,
}: BadgeNotificationCheckProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (badgeData && badgeData.length > 0) {
      // 少し待ってからダイアログを表示
      const timer = setTimeout(() => {
        setIsDialogOpen(true);
      }, 1500); // 1.5秒待つ（レベルアップ通知より少し遅く）

      return () => clearTimeout(timer);
    }
  }, [badgeData]);

  const handleDialogClose = async () => {
    setIsDialogOpen(false);

    if (!badgeData || badgeData.length === 0) return;

    // Server Actionを呼び出して通知を確認済みとしてマーク
    try {
      const badgeIds = badgeData.map((item) => item.id);
      const result = await markBadgeNotificationAsSeenAction(badgeIds);
      if (!result.success) {
        console.error(
          "Failed to mark badge notifications as seen:",
          result.error,
        );
      }
    } catch (error) {
      console.error("Error marking badge notifications as seen:", error);
    }
  };

  if (!badgeData || badgeData.length === 0) {
    return null;
  }

  return (
    <BadgeNotificationDialog
      isOpen={isDialogOpen}
      onClose={handleDialogClose}
      badges={badgeData}
    />
  );
}
