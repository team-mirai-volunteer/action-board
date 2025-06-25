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
  referralCode?: string | null;
};

export function MissionCompleteDialog({
  isOpen,
  onClose,
  mission,
  referralCode,
}: Props) {
  const message = `「${mission.title}」を達成しました！`;

  const origin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const referralUrl = referralCode
    ? `${origin}/sign-up?ref=${referralCode}`
    : `${origin}/sign-up`;

  const shareMessage = `チームみらいでは、皆さんが楽しみながらチームみらいの活動を応援できる「アクションボード」を公開しました！
ご自身の応援が目に見える形で分かります。応援が楽しくなる、様々なランキングもあります。
登録しても義務や費用は一切発生しないのでご安心ください！

👇1分でLINEまたはメールでかんたんに登録できます！
${referralUrl}

ご登録よろしくお願いします！
#チームみらい`;

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
