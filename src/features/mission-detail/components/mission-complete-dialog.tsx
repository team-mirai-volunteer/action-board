"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShareButton } from "@/features/mission-detail/components/share-buttons/share-button";
import { ShareFacebookButton } from "@/features/mission-detail/components/share-buttons/share-facebook-button";
import { ShareLineButton } from "@/features/mission-detail/components/share-buttons/share-line-button";
import { ShareTwitterButton } from "@/features/mission-detail/components/share-buttons/share-twitter-button";
import { ShareUrlButton } from "@/features/mission-detail/components/share-buttons/share-url-button";
import type { Tables } from "@/lib/types/supabase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mission: Tables<"missions">;
};

export function MissionCompleteDialog({ isOpen, onClose, mission }: Props) {
  const message = `「${mission.title}」を達成しました！`;
  const shareMessage = `チームみらいアクションボードで${message} #チームみらい\n`;

  // OGP画像付きURLを生成（slugベース）
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/missions/${mission.slug}?type=complete`
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
          <Image
            src={
              mission.ogp_image_url
                ? mission.ogp_image_url
                : `/api/missions/${mission.slug}/og?type=complete`
            }
            alt="ミッションクリア"
            width={400}
            height={210}
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
              missionSlug={mission.slug}
              url={shareUrl}
            />
            <ShareFacebookButton missionSlug={mission.slug} url={shareUrl} />
            <ShareLineButton missionSlug={mission.slug} url={shareUrl} />
            <ShareButton
              message={shareMessage}
              missionSlug={mission.slug}
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
