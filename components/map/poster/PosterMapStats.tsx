"use client";

import { statusConfig } from "@/app/map/poster/statusConfig";
import type { BoardStatus } from "@/lib/types/poster-boards";

interface PosterMapStatsProps {
  registeredCount: number;
  actualTotalCount?: number;
  completedCount: number;
  completionRate: number;
  statusCounts: Record<BoardStatus, number>;
}

export function PosterMapStats({
  registeredCount,
  actualTotalCount,
  completedCount,
  completionRate,
  statusCounts,
}: PosterMapStatsProps) {
  const totalCount =
    actualTotalCount && actualTotalCount > 0
      ? actualTotalCount
      : registeredCount;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 主要統計 */}
        <div className="flex items-baseline gap-4">
          <div className="flex items-baseline gap-1">
            {actualTotalCount && actualTotalCount > 0 && (
              <span className="text-2xl font-bold">
                {registeredCount.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-muted-foreground">総数</span>
            <span className="text-xs text-muted-foreground">
              (公表: {totalCount.toLocaleString()})
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-green-600">
              {completedCount.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">完了</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-600">
              {completionRate}%
            </span>
            <span className="text-xs text-muted-foreground">達成率</span>
          </div>
        </div>

        {/* 区切り線 */}
        <div className="hidden sm:block h-6 w-px bg-border" />

        {/* ステータス別内訳 */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = statusCounts[status as BoardStatus] || 0;
            return (
              <div key={status} className="flex items-center gap-1">
                <div
                  className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${config.color}`}
                />
                <span className="text-xs whitespace-nowrap">
                  {config.shortLabel || config.label}
                  <span className="ml-0.5 font-semibold">
                    {count.toLocaleString()}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
