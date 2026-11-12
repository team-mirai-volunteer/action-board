import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * トップページ上部のサポーター向けリンクカード（ログイン時のみ表示）
 *
 * サポーターポータルとイベントカレンダー（いずれもNotionの公開ページ）への導線。
 * URLを差し替える場合はここだけを変更する。
 */
export const SUPPORTER_QUICK_LINKS = [
  {
    title: "サポーターポータル",
    description: "活動の進め方・困ったときはこちら",
    href: "https://team-mirai.notion.site/1f8f6f56bae180fd96e2f809bf1ca0bf?v=1f8f6f56bae181239689000c7e1d858e",
  },
  {
    title: "イベントカレンダー",
    description: "参加できるイベントを探す",
    href: "https://team-mirai.notion.site/414f6f56bae18052862fdbc6397f21e9",
  },
] as const;

export function SupporterQuickLinks() {
  return (
    <section className="py-6 md:py-10 bg-background">
      {/* 横幅はトップのランキング（RankingSection）と揃える */}
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {SUPPORTER_QUICK_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <Card className="h-full p-4 md:p-6 bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 leading-snug">
                    {link.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 shrink-0 text-gray-400" />
                </div>
                <p className="mt-2 text-xs md:text-sm text-gray-600">
                  {link.description}
                </p>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
