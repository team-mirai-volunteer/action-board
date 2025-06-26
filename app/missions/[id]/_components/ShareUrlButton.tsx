"use client";

import { toast } from "sonner";

type Props = {
  url: string;
  className?: string;
  children?: React.ReactNode;
};

export function ShareUrlButton({ url, className, children }: Props) {
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URLをコピーしました！");
    } catch (error) {
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
      <img
        src="/img/icon-Copy2x.png"
        alt="コピー"
        className="w-full h-full object-contain"
      />
    </button>
  );
}
