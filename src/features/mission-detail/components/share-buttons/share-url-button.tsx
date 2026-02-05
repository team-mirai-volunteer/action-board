"use client";

import Image from "next/image";
import { toast } from "sonner";

type Props = {
  url: string;
};

export function ShareUrlButton({ url }: Props) {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URLをコピーしました！");
    } catch (_error) {
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("URLをコピーしました！");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopyUrl}
      className="w-[50px] h-[50px] rounded-full hover:opacity-80 transition-opacity"
      aria-label="シェアURLをコピー"
    >
      <Image
        src="/img/icon-Copy2x.png"
        alt="コピー"
        width={50}
        height={50}
        className="w-full h-full object-contain"
      />
    </button>
  );
}
