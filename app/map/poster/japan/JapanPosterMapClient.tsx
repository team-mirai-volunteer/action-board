"use client";

import { PosterMapStats } from "@/components/map/poster/PosterMapStats";
import { Button } from "@/components/ui/button";
import type { BoardStatus, PosterBoardTotal } from "@/lib/types/poster-boards";
import type { PosterBoardMinimal } from "@/lib/types/poster-boards-minimal";
import { calculateProgressRate } from "@/lib/utils/poster-progress";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";

// Dynamic import to avoid SSR issues - Use clustering version for better performance
const PosterMapWithCluster = dynamic(() => import("../PosterMapWithCluster"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      地図を読み込み中...
    </div>
  ),
});

interface Props {
  initialTotals: PosterBoardTotal[];
  initialBoards: PosterBoardMinimal[];
}

export default function JapanPosterMapClient({
  initialTotals,
  initialBoards,
}: Props) {
  // 全体の統計を計算
  const totalStats = useMemo(() => {
    // 選管データの総数を合計
    const actualTotal = initialTotals
      .filter((t) => !t.city)
      .reduce((sum, t) => sum + t.total_count, 0);

    // 実際のボードデータから統計を計算（すべて座標がある前提）
    const allStatuses: Record<BoardStatus, number> = {
      not_yet: 0,
      not_yet_dangerous: 0,
      reserved: 0,
      done: 0,
      error_wrong_place: 0,
      error_damaged: 0,
      error_wrong_poster: 0,
      other: 0,
    };

    // すべてのボードをカウント（サーバー側で座標がないものは除外済み）
    for (const board of initialBoards) {
      if (board.status) {
        allStatuses[board.status] = (allStatuses[board.status] || 0) + 1;
      }
    }

    const registeredTotal = initialBoards.length;
    const completed = allStatuses.done || 0;
    const percentage = calculateProgressRate(completed, registeredTotal);

    return {
      actualTotal,
      registeredTotal,
      completed,
      percentage,
      statuses: allStatuses,
    };
  }, [initialBoards, initialTotals]);

  const handleBoardClick = () => {
    // 全国マップでは詳細表示機能は提供しない
    // 必要に応じて、ここに簡単な情報表示のtoastなどを追加可能
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-3 p-3">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-lg font-bold">日本全国ポスター掲示板マップ</h1>
        <p className="text-xs text-muted-foreground">
          全国のポスター掲示板の配置状況を地図上で確認できます
        </p>
      </div>

      {/* Map - 最優先表示 */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <PosterMapWithCluster
          boards={initialBoards}
          onBoardClick={handleBoardClick}
          center={[36.2048, 138.2529]} // 日本の中心付近
          prefectureKey="japan" // 日本全国表示用の特別なキー
        />
      </div>

      {/* 統計情報とステータス */}
      <PosterMapStats
        registeredCount={totalStats.registeredTotal}
        actualTotalCount={totalStats.actualTotal}
        completedCount={totalStats.completed}
        completionRate={totalStats.percentage}
        statusCounts={totalStats.statuses}
      />

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" asChild>
          <Link href="/#featured-missions">ミッション一覧に戻る</Link>
        </Button>
      </div>
    </div>
  );
}
