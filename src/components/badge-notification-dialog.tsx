"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BadgeDisplay } from "@/components/user-badges/badge-display";
import type { UserBadge } from "@/lib/types/badge";
import { Award } from "lucide-react";

interface BadgeNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  badges: {
    badge: UserBadge;
    title: string;
    description: string;
  }[];
}

export function BadgeNotificationDialog({
  isOpen,
  onClose,
  badges,
}: BadgeNotificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            新しいバッジを獲得しました！
          </DialogTitle>
          <DialogDescription>
            おめでとうございます！
            <br />
            ランキングで上位に入り、新しいバッジを獲得しました。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {badges.map((item) => (
            <BadgeDisplay
              key={item.badge.id}
              badge={item.badge}
              className="w-fit"
            />
            // </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            確認しました
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
