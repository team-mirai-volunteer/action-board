"use client";

import {
  FOOTER_BUTTON_STYLES,
  FOOTER_IMAGE_SIZES,
} from "@/lib/constants/footer";
import { Copy } from "lucide-react";
import Image from "next/image";

interface SocialShareSectionProps {
  onLineShare: () => void;
  onTwitterShare: () => void;
  onFacebookShare: () => void;
  onCopyUrl: () => void;
}

export function SocialShareSection({
  onLineShare,
  onTwitterShare,
  onFacebookShare,
  onCopyUrl,
}: SocialShareSectionProps) {
  return (
    <div className="bg-white py-12">
      <div className="px-4 md:container md:mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
            📢 このページをシェアしよう！
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            あなたの周りの人にもアクションボードを届けよう。
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <button
              type="button"
              onClick={onLineShare}
              className={FOOTER_BUTTON_STYLES.socialShare}
              aria-label="LINEでシェア"
            >
              <Image
                src="https://team-mir.ai/images/sns/icon_line.png"
                alt="LINE"
                width={FOOTER_IMAGE_SIZES.socialIcon.width}
                height={FOOTER_IMAGE_SIZES.socialIcon.height}
                className="rounded-full"
              />
            </button>
            <button
              type="button"
              onClick={onTwitterShare}
              className={FOOTER_BUTTON_STYLES.socialShare}
              aria-label="Xでシェア"
            >
              <Image
                src="https://team-mir.ai/images/sns/icon_x.png"
                alt="X (Twitter)"
                width={FOOTER_IMAGE_SIZES.socialIcon.width}
                height={FOOTER_IMAGE_SIZES.socialIcon.height}
                className="rounded-full"
              />
            </button>
            <button
              type="button"
              onClick={onFacebookShare}
              className={FOOTER_BUTTON_STYLES.socialShare}
              aria-label="Facebookでシェア"
            >
              <Image
                src="https://team-mir.ai/images/sns/icon_facebook.png"
                alt="Facebook"
                width={FOOTER_IMAGE_SIZES.socialIcon.width}
                height={FOOTER_IMAGE_SIZES.socialIcon.height}
                className="rounded-full"
              />
            </button>
            <button
              type="button"
              onClick={onCopyUrl}
              className={FOOTER_BUTTON_STYLES.socialShareCopy}
              aria-label="URLをコピー"
            >
              <Copy className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
