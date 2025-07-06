import { FOOTER_STYLES } from "@/lib/constants/footer";
import type { SocialShareProps } from "@/types/footer";
import { Copy, Facebook, MessageCircle, Twitter } from "lucide-react";

export function SocialShareSection({
  onLineShare,
  onTwitterShare,
  onFacebookShare,
  onCopyUrl,
}: SocialShareProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
          このページをシェア
        </h2>
        <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
          チームみらいアクションボードを友達や家族と共有して、一緒に政治参加を始めましょう！
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={onLineShare}
            className={`${FOOTER_STYLES.socialButton} bg-green-500 hover:bg-green-600 text-white`}
          >
            <MessageCircle className="w-5 h-5" />
            LINE
          </button>
          <button
            type="button"
            onClick={onTwitterShare}
            className={`${FOOTER_STYLES.socialButton} bg-blue-500 hover:bg-blue-600 text-white`}
          >
            <Twitter className="w-5 h-5" />X (Twitter)
          </button>
          <button
            type="button"
            onClick={onFacebookShare}
            className={`${FOOTER_STYLES.socialButton} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            <Facebook className="w-5 h-5" />
            Facebook
          </button>
          <button
            type="button"
            onClick={onCopyUrl}
            className={`${FOOTER_STYLES.socialButton} bg-gray-600 hover:bg-gray-700 text-white`}
          >
            <Copy className="w-5 h-5" />
            URLをコピー
          </button>
        </div>
      </div>
    </div>
  );
}
