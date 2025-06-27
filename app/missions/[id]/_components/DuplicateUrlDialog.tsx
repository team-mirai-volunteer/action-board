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
import { AlertCircle } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  duplicateUrl: string;
  missionTitle: string;
};

export function DuplicateUrlDialog({
  isOpen,
  onClose,
  duplicateUrl,
  missionTitle,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            重複したURLです
          </DialogTitle>
          <DialogDescription className="text-left">
            このYouTube動画のURLは、「{missionTitle}
            」ミッションで既に提出済みです。
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600 break-all">{duplicateUrl}</p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            別の動画を選択する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
