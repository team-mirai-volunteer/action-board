import type React from "react";
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
 * ヘッダー、タイトル、更新日時の表示を統一します。
 */
export function MetricsLayout({
  children,
  title,
  lastUpdated,
}: MetricsLayoutProps) {
  return (
    <section className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-lg bg-white rounded-md p-6 py-8">
        {/* ヘッダー部分：タイトルと最終更新日時 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black mb-1">{title}</h2>
          <p className="text-xs text-black">{lastUpdated} 更新</p>
        </div>

        {/* メトリクス表示エリア */}
        {children}
      </Card>
    </section>
  );
}
