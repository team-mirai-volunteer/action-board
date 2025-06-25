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
import { X } from "lucide-react";
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
  const shareMessage = `チームみらいアクションボードで${message} #チームみらい\n`;

  // OGP画像付きURLを生成
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/missions/${mission.id}?type=complete`
      : "";

  const handleShareClick = (platform: string) => {
    switch (platform) {
      case "x":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        break;
      case "share":
        if (navigator.share) {
          navigator.share({
            title: message,
            text: shareMessage,
            url: shareUrl,
          });
        }
        break;
      case "copy":
        navigator.clipboard.writeText(shareUrl);
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-8 rounded-xl [&>button]:w-6 [&>button]:h-6 [&>button>svg]:w-6 [&>button>svg]:h-6">
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
            className="mx-auto"
          />
        </DialogHeader>

        <section className="py-8">
          <header className="text-center mb-4">
            <p className="text-sm font-medium">シェアして応援の輪を広げよう</p>
          </header>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleShareClick("x")}
              className="w-[60px] h-[60px] rounded-full hover:opacity-80 transition-opacity"
              aria-label="Xでシェア"
            >
              <img
                src="/img/icon-X2x.png"
                alt="X"
                className="w-full h-full object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => handleShareClick("facebook")}
              className="w-[60px] h-[60px] rounded-full hover:opacity-80 transition-opacity"
              aria-label="Facebookでシェア"
            >
              <img
                src="/img/icon-facebook2x.png"
                alt="Facebook"
                className="w-full h-full object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => handleShareClick("share")}
              className="w-[60px] h-[60px] rounded-full hover:opacity-80 transition-opacity"
              aria-label="その他のサービスでシェア"
            >
              <img
                src="/img/icon-Shere2x.png"
                alt="Share"
                className="w-full h-full object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() => handleShareClick("copy")}
              className="w-[60px] h-[60px] rounded-full hover:opacity-80 transition-opacity"
              aria-label="シェアURLをコピー"
            >
              <img
                src="/img/icon-Copy2x.png"
                alt="Copy"
                className="w-full h-full object-contain"
              />
            </button>
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
