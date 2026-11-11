import type React from "react";
import {
  TOP_SECTION_CARD_CLASS_NAME,
  TopSectionLayout,
} from "@/components/top/top-section-layout";
import { Card } from "@/components/ui/card";

interface MetricsLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

/**
 * メトリクス表示レイアウトコンポーネント
 *
 * メトリクス表示の共通レイアウトを提供します。
 * タイトルと更新日時はカードの外にセクション見出しとして出し、
 * カードの幅・余白はトップページの活動タイムラインに揃えます。
 */
export function MetricsLayout({
  children,
  title,
  lastUpdated,
}: MetricsLayoutProps) {
  return (
    <section className="py-12 md:py-16 bg-background">
      <TopSectionLayout title={title} subtitle={`${lastUpdated} 更新`}>
        {/* メトリクス表示エリア */}
        <Card className={TOP_SECTION_CARD_CLASS_NAME}>{children}</Card>
      </TopSectionLayout>
    </section>
  );
}
