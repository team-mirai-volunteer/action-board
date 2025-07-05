import { FOOTER_CONFIG } from "@/config/footer";
import {
  FOOTER_BUTTON_STYLES,
  FOOTER_IMAGE_SIZES,
} from "@/lib/constants/footer";
import type { FooterSNSPlatform } from "@/types/footer";
import Image from "next/image";
import Link from "next/link";

export function OfficialSNSSection() {
  return (
    <div className="bg-teal-50 py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">チームみらい公式SNS</h2>
        <p className="text-sm text-gray-600 mb-8">
          最新の活動情報や舞台裏を、いち早くお届けします。ぜひフォロー＆チャンネル登録で応援してください！
        </p>
        <div className="flex gap-4 justify-center mb-8 p-4 bg-white rounded-lg max-w-6xl mx-auto">
          {(
            Object.entries(FOOTER_CONFIG.snsLinks) as [
              FooterSNSPlatform,
              string,
            ][]
          ).map(([platform, url]) => (
            <Link
              key={platform}
              href={url}
              className={FOOTER_BUTTON_STYLES.officialSns}
              aria-label={`${platform}公式アカウント`}
            >
              <Image
                src={`${FOOTER_CONFIG.images.basePath}/${FOOTER_CONFIG.images.icons[platform]}`}
                alt={platform}
                width={FOOTER_IMAGE_SIZES.socialIcon.width}
                height={FOOTER_IMAGE_SIZES.socialIcon.height}
                className="rounded-full"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
