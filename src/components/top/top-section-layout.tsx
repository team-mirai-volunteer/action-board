import type React from "react";

/**
 * トップページのセクションカードの共通クラス
 *
 * 活動タイムラインのカードと同じ幅・角丸・余白にそろえるために使う。
 */
export const TOP_SECTION_CARD_CLASS_NAME =
  "w-full max-w-lg rounded-xl shadow-sm transition-all duration-300 p-8 bg-white";

interface TopSectionLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * トップページのセクション共通レイアウト
 *
 * 活動タイムラインと同じく、カードの外にセクション見出し（とサブタイトル）を置き、
 * その下にカードを中央寄せで並べる。
 */
export function TopSectionLayout({
  title,
  subtitle,
  children,
}: TopSectionLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex flex-col gap-6 items-center">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
