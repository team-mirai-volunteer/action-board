import { Copy, Facebook, MessageSquare, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const handleLineShare = () => {
    const shareUrl = window.location.href;
    const lineIntentUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;
    window.open(lineIntentUrl, "_blank", "noopener,noreferrer");
  };

  const handleTwitterShare = () => {
    const shareUrl = window.location.href;
    const message =
      "チームみらい Action Board - あなたの周りの人にもアクションボードを届けよう！";
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntentUrl, "_blank", "noopener,noreferrer");
  };

  const handleFacebookShare = () => {
    const shareUrl = window.location.href;
    const facebookIntentUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookIntentUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  return (
    <footer className="w-full mt-16 bg-background">
      <div className="bg-gray-50 py-12">
        <div className="px-4 md:container md:mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              📢 このページをシェアしよう！
            </h2>
            <p className="text-gray-600 mb-8">
              あなたの周りの人にもアクションボードを届けよう。
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <button
                type="button"
                onClick={handleLineShare}
                className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                aria-label="LINEでシェア"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleTwitterShare}
                className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                aria-label="Xでシェア"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleFacebookShare}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                aria-label="Facebookでシェア"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white hover:bg-gray-500 transition-colors"
                aria-label="URLをコピー"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-12">
        <div className="px-4 md:container md:mx-auto text-center">
          <h2 className="text-xl font-bold mb-4">ご意見をお聞かせください</h2>
          <p className="text-gray-600 mb-8">
            チームみらいアクションボードより良いサービスにするため、
            <br />
            フィードバックをお寄せください。
          </p>
          <Link
            href="https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-3 rounded-full hover:bg-teal-600 transition-colors"
          >
            ✏️ フィードバックする
          </Link>
        </div>
      </div>

      <div className="bg-teal-50 py-12">
        <div className="px-4 md:container md:mx-auto">
          <h2 className="text-xl font-bold mb-4">チームみらい公式SNS</h2>
          <p className="text-gray-600 mb-8">
            最新の活動情報や舞台裏を、いち早くお届けします。ぜひフォロー＆チャンネル登録で応援してください！
          </p>
          <div className="flex gap-4 mb-8">
            <Link
              href="#"
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
            >
              <span className="font-bold text-sm">LINE</span>
            </Link>
            <Link
              href="#"
              className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-colors"
            >
              <span className="font-bold text-sm">YT</span>
            </Link>
            <Link
              href="#"
              className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            >
              <span className="font-bold text-sm">X</span>
            </Link>
            <Link
              href="#"
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <span className="font-bold text-sm">IG</span>
            </Link>
            <Link
              href="#"
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
            >
              <span className="font-bold text-sm">f</span>
            </Link>
            <Link
              href="#"
              className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors"
            >
              <span className="font-bold text-sm">n</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg font-bold text-lg mb-4">
              チーム
              <br />
              みらい
            </div>
            <p className="text-sm text-gray-600">アクションボード</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="px-4 md:container md:mx-auto py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-sm">
              <Link
                href="https://team-mir.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200 block"
              >
                運営組織
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                プライバシーポリシー
              </Link>
              <Link
                href="https://team-mirai.notion.site/204f6f56bae1800da8d5dd9c61dd7cd1?pvs=105"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                ご意見箱
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Team Mirai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
