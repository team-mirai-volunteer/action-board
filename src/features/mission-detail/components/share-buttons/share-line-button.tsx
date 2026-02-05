"use client";

import Image from "next/image";

type Props = {
  missionSlug: string;
  url?: string;
};

export function ShareLineButton({ missionSlug, url }: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? `${window.location.origin}/missions/${missionSlug}`;
  const handleShare = () => {
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity md:hidden"
      aria-label="LINEでシェア"
    >
      <Image
        src="/img/icon-line2x.png"
        alt="LINE"
        width={50}
        height={50}
        className="w-full h-full object-contain"
      />
    </button>
  );
}
