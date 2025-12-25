import PosterMapPageClientOptimized from "@/features/map-poster/components/poster-map-page-client-optimized";
import {
  getPosterBoardSummaryByPrefecture,
  getPosterBoardTotals,
} from "@/features/map-poster/services/poster-boards";
import type { Metadata } from "next";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "ポスター掲示板マップ",
  description: "チームはやまのポスター掲示板の配置状況を確認できます",
};

export default async function PosterMapPage() {
  // サーバーサイドで統計データのみを取得
  const [summary, totals] = await Promise.all([
    getPosterBoardSummaryByPrefecture(),
    getPosterBoardTotals(),
  ]);

  return (
    <PosterMapPageClientOptimized
      initialSummary={summary}
      initialTotals={totals}
    />
  );
}
