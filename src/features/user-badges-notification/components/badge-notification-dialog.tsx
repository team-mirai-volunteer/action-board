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
import type { UserBadge } from "@/features/user-badges/badge-types";
import { BadgeItem } from "@/features/user-badges/components/badge-item";
import { Award } from "lucide-react";

interface BadgeNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  badges: UserBadge[];
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
            <BadgeItem key={item.id} badge={item} className="w-fit" />
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
