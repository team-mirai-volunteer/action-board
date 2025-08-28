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
import type { Tables } from "@/lib/types/supabase";
import { ShareButton } from "./ShareButton";
import { ShareFacebookButton } from "./ShareFacebookButton";
import { ShareLineButton } from "./ShareLineButton";
import { ShareTwitterButton } from "./ShareTwitterButton";
import { ShareUrlButton } from "./ShareUrlButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mission: Tables<"missions">;
};

export function MissionCompleteDialog({ isOpen, onClose, mission }: Props) {
  const message = `「${mission.title}」を達成しました！`;
  const shareMessage = `チームはやまアクションボードで${message} #チームはやま\n`;

  // OGP画像付きURLを生成
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/missions/${mission.id}?type=complete`
      : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-36px)] max-w-md mx-auto p-[18px] rounded-2xl [&>button]:w-6 [&>button]:h-6 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center text-xl">
            おめでとうございます！
          </DialogTitle>
          <DialogDescription className="text-center">
            {message}
          </DialogDescription>
          <img
            src={
              mission.ogp_image_url
                ? mission.ogp_image_url
                : `/api/missions/${mission.id}/og?type=complete`
            }
            alt="ミッションクリア"
            className="w-full mx-auto min-h-[158px] md:min-h-[215px]"
          />
        </DialogHeader>

        <section className="py-4">
          <header className="text-center mb-4">
            <p className="text-sm font-medium">シェアして応援の輪を広げよう</p>
          </header>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <ShareTwitterButton
              message={shareMessage}
              missionId={mission.id}
              url={shareUrl}
            />
            <ShareFacebookButton missionId={mission.id} url={shareUrl} />
            <ShareLineButton missionId={mission.id} url={shareUrl} />
            <ShareButton
              message={shareMessage}
              missionId={mission.id}
              url={shareUrl}
            />
            <ShareUrlButton url={shareUrl} />
          </div>
        </section>

        <DialogFooter className="pt-4">
          <Button onClick={onClose} className="w-full">
            このまま閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
