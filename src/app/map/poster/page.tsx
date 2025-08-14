import {
  getPosterBoardSummaryByPrefecture,
  getPosterBoardTotals,
} from "@/lib/services/poster-boards";
import type { Metadata } from "next";
import PosterMapPageClientOptimized from "./PosterMapPageClientOptimized";

export const metadata: Metadata = {
  title: "ポスター掲示板マップ",
  description: "チームみらいのポスター掲示板の配置状況を確認できます",
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
