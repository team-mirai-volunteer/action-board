import {
  getPosterBoardTotals,
  getPosterBoardsMinimal,
} from "@/lib/services/poster-boards";
import type { Metadata } from "next";
import JapanPosterMapClient from "./JapanPosterMapClient";

export const metadata: Metadata = {
  title: "日本全国ポスター掲示板マップ",
  description: "チームみらいのポスター掲示板の全国配置状況を確認できます",
};

export default async function JapanPosterMapPage() {
  // サーバーサイドでデータを取得（最小限のデータのみ）
  const [totals, boards] = await Promise.all([
    getPosterBoardTotals(),
    getPosterBoardsMinimal(), // パフォーマンス向上のため最小限のデータのみ取得
  ]);

  return <JapanPosterMapClient initialTotals={totals} initialBoards={boards} />;
}
