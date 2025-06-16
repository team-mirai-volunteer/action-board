"use client";
import { Button } from "@/components/ui/button";
import { CopyIcon, FacebookIcon } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title?: string;
  url?: string;
  className?: string;
}

/**
 * SNS共有ボタンコンポーネント
 */
const ShareButtons: FC<ShareButtonsProps> = ({
  title = "みらいアクションボードでできることを発見しよう！",
  url,
  className = "",
}) => {
  // URLが指定されていない場合は現在のページのURLを使用
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  // URLをクリップボードにコピー
  const copyToClipboard = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast.success("URLをコピーしました");
        },
        (err) => {
          console.error("URLのコピーに失敗しました: ", err);
          toast.error("URLのコピーに失敗しました");
        },
      );
    }
  };

  // Twitter共有URL
  const getTwitterShareUrl = () => {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title,
    )}&url=${encodeURIComponent(shareUrl)}`;
  };

  // Facebook共有URL
  const getFacebookShareUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  };

  // LINEで共有URL
  const getLineShareUrl = () => {
    return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <div className={`${className}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">📣 このページをシェアしよう！</h3>
        <p className="text-sm text-muted-foreground">
          あなたの周りの人にもアクションボードを紹介しよう。
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        {/* LINE */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-[#06c755] hover:bg-[#06c755]/90 text-white border-none"
          onClick={() => window.open(getLineShareUrl(), "_blank")}
          aria-label="LINEでシェア"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-labelledby="line-title"
            role="img"
          >
            <title id="line-title">LINE Logo</title>
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
        </Button>

        {/* Twitter/X */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-black hover:bg-gray-800 text-white border-none"
          onClick={() => window.open(getTwitterShareUrl(), "_blank")}
          aria-label="Xでシェア"
        >
          <img
            src="/img/x-logo.svg"
            alt="X Logo"
            title="X Logo"
            width="20"
            height="20"
            className="w-5 h-5"
            aria-labelledby="x-title"
          />
        </Button>

        {/* Facebook */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 bg-[#1877f2] hover:bg-[#1877f2]/90 text-white border-none"
          onClick={() => window.open(getFacebookShareUrl(), "_blank")}
          aria-label="Facebookでシェア"
        >
          <FacebookIcon className="h-5 w-5" />
        </Button>

        {/* Copy URL */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10"
          onClick={copyToClipboard}
          aria-label="URLをコピー"
        >
          <CopyIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ShareButtons;
