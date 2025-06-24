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
  const shareMessage = `チームみらいアクションボードで${message} #チームみらい\n`;

  // OGP画像付きURLを生成
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/missions/${mission.id}?type=complete`
      : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
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
          />
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          <ShareTwitterButton
            message={shareMessage}
            missionId={mission.id}
            className="w-full"
            url={shareUrl}
          >
            Xでシェア
          </ShareTwitterButton>
          <ShareFacebookButton
            missionId={mission.id}
            className="w-full"
            url={shareUrl}
          >
            Facebookでシェア
          </ShareFacebookButton>
          {/* 内部で判定しておりモバイルのみ表示 */}
          <ShareLineButton
            className="w-full md:hidden"
            missionId={mission.id}
            url={shareUrl}
          >
            LINEでシェア
          </ShareLineButton>
          {/* navigator.share()を使っているのでモバイルのみ表示 */}
          <ShareButton
            className="w-full md:hidden"
            message={shareMessage}
            missionId={mission.id}
            url={shareUrl}
          >
            その他のサービスにシェア
          </ShareButton>
          <ShareUrlButton url={shareUrl} className="w-full">
            シェアURLをコピー
          </ShareUrlButton>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
