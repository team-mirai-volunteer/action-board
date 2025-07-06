import { footerConfig } from "@/config/footer";
import { FOOTER_STYLES } from "@/lib/constants/footer";
import Image from "next/image";
import Link from "next/link";

const iconMap = {
  twitter: "/icons/twitter.svg",
  instagram: "/icons/instagram.svg",
  youtube: "/icons/youtube.svg",
  tiktok: "/icons/tiktok.svg",
} as const;

export function OfficialSNSSection() {
  const { officialSNS } = footerConfig;

  return (
    <div className="bg-gray-100 py-12">
      <div className="px-4 md:container md:mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {officialSNS.title}
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          チームみらいの最新情報をチェックして、政治参加の輪を広げましょう！
        </p>
        <div className="flex justify-center gap-6">
          {officialSNS.links.map((link) => (
            <Link
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${FOOTER_STYLES.snsLink} bg-white shadow-lg hover:shadow-xl`}
              aria-label={link.name}
            >
              <Image
                src={iconMap[link.icon as keyof typeof iconMap]}
                alt={link.name}
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
