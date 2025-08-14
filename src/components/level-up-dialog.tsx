"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Image from "next/image";
import React from "react";

interface LevelUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export function LevelUpDialog({
  isOpen,
  onClose,
  newLevel,
}: LevelUpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-xs bg-white rounded-2xl border-0 shadow-2xl"
        style={{ width: "90vw", maxWidth: "360px" }}
      >
        <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
          サポーターレベルが <br /> アップしました！
        </DialogTitle>
        <div className="flex flex-col items-center">
          <div className="relative mt-3 mb-8">
            <Image
              alt="particle"
              src="/img/level-up-particle.png"
              width="230"
              height="96"
              style={{
                position: "absolute",
                top: 8,
                left: -45,
                width: 230,
                maxWidth: "none",
              }}
            />
            <div
              className="rounded-full flex flex-col gap-1 items-center justify-center bg-gradient-level text-center"
              style={{ width: 134, height: 134 }}
            >
              <div className="text-white text-lg font-medium tracking-wider leading-none">
                LEVEL
              </div>
              <div
                className="text-white text-6xl font-bold leading-none"
                style={{ lineHeight: 0.85 }}
              >
                {newLevel}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
