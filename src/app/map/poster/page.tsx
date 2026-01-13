import PosterMapPageClientOptimized from "@/features/map-poster/components/poster-map-page-client-optimized";
import {
  getPosterBoardSummaryByDistrict,
  getPosterBoardTotals,
} from "@/features/map-poster/services/poster-boards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ポスター掲示板マップ",
  description: "チームみらいのポスター掲示板の配置状況を確認できます",
};

export default async function PosterMapPage() {
  // サーバーサイドで区割り別統計データを取得
  const [summary, totals] = await Promise.all([
    getPosterBoardSummaryByDistrict(),
    getPosterBoardTotals(),
  ]);

  return (
    <PosterMapPageClientOptimized
      initialSummary={summary}
      initialTotals={totals}
    />
  );
}
