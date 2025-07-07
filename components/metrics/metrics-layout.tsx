import type React from "react";

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
    <section className="bg-gradient-hero flex justify-center py-6 px-4">
      <div className="w-full max-w-xl bg-white rounded-md shadow-custom p-6">
        {/* ヘッダー部分：タイトルと最終更新日時 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black mb-1">{title}</h2>
          <p className="text-xs text-black">{lastUpdated} 更新</p>
        </div>

        {/* メトリクス表示エリア */}
        {children}
      </div>
    </section>
  );
}
