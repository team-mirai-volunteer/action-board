"use client";

import Image from "next/image";

type Props = {
  missionSlug: string;
  url?: string;
};

export function ShareFacebookButton({ missionSlug, url }: Props) {
  // SNSシェア用のハンドラ関数
  const shareUrl = url ?? `${window.location.origin}/missions/${missionSlug}`;
  const handleShare = () => {
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity"
      aria-label="Facebookでシェア"
    >
      <Image
        src="/img/icon-facebook2x.png"
        alt="Facebook"
        width={50}
        height={50}
        className="w-full h-full object-contain"
      />
    </button>
  );
}
