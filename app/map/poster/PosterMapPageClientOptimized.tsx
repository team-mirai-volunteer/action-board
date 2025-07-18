"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSTER_PREFECTURE_MAP } from "@/lib/constants/poster-prefectures";
import type { BoardStatus, PosterBoardTotal } from "@/lib/types/poster-boards";
import {
  calculateProgressRate,
  getCompletedCount,
  getRegisteredCount,
} from "@/lib/utils/poster-progress";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { statusConfig } from "./statusConfig";

interface Props {
  initialSummary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  >;
  initialTotals: PosterBoardTotal[];
}

export default function PosterMapPageClientOptimized({
  initialSummary,
  initialTotals,
}: Props) {
  // 都道府県別の選管データをマップに変換
  const totalsByPrefecture = useMemo(() => {
    const map: Record<string, number> = {};
    for (const total of initialTotals) {
      if (!total.city) {
        // 都道府県レベルのデータのみ
        map[total.prefecture] = total.total_count;
      }
    }
    return map;
  }, [initialTotals]);

  // 都道府県別の統計を使用
  const boardStats = useMemo(() => {
    const stats: Record<string, Record<BoardStatus, number>> = {};
    for (const [prefecture, data] of Object.entries(initialSummary)) {
      stats[prefecture] = data.statuses;
    }
    return stats;
  }, [initialSummary]);

  // 全体の統計を計算（登録済み掲示板数基準）
  const totalStats = useMemo(() => {
    // 選管データの総数を合計
    const actualTotal = Object.values(totalsByPrefecture).reduce(
      (sum, count) => sum + count,
      0,
    );

    // 全都道府県の統計を集計
    let registeredTotal = 0;
    let completed = 0;
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

    for (const data of Object.values(initialSummary)) {
      registeredTotal += data.total;
      completed += data.statuses.done || 0;

      // 各ステータスの数を集計
      for (const [status, count] of Object.entries(data.statuses)) {
        allStatuses[status as BoardStatus] += count;
      }
    }

    // 進捗率は登録済み掲示板数を基準に計算
    const percentage = calculateProgressRate(completed, registeredTotal);

    return {
      actualTotal, // 選管データの総数
      registeredTotal, // DB登録数
      completed,
      percentage,
      statuses: allStatuses, // 各ステータスの合計
    };
  }, [initialSummary, totalsByPrefecture]);

  // 都道府県別の完了率を計算（登録済み掲示板数基準）
  const getCompletionRate = (
    _prefecture: string,
    stats: Record<BoardStatus, number>,
  ) => {
    const registeredTotal = getRegisteredCount(stats);
    const completed = getCompletedCount(stats);
    return calculateProgressRate(completed, registeredTotal);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">ポスター掲示板マップ</h1>
        <p className="text-muted-foreground">
          都道府県を選択して、各地域のポスター掲示板の状況を確認できます
        </p>
      </div>

      {/* Overall Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>全体の進捗状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              {totalStats.actualTotal > 0 && (
                <div className="text-2xl font-bold">
                  {totalStats.registeredTotal.toLocaleString()}
                </div>
              )}
              <div className="text-sm text-muted-foreground">総掲示板数</div>
              <div className="text-xs text-muted-foreground">
                (選管公表数: {totalStats.actualTotal.toLocaleString()})
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totalStats.completed.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">完了</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totalStats.percentage}%
              </div>
              <div className="text-sm text-muted-foreground">達成率</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>進捗</span>
              <span className="font-medium">{totalStats.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${totalStats.percentage}%` }}
              />
            </div>
          </div>
          {/* ステータス詳細 */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">ステータス内訳</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(totalStats.statuses).map(([status, count]) => {
                if (count === 0) return null;
                const config = statusConfig[status as BoardStatus];
                return (
                  <div key={status} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${config.color}`} />
                    <span className="text-xs text-muted-foreground">
                      {config.label}: {count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prefecture List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">都道府県から選択</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(POSTER_PREFECTURE_MAP).map(
            ([prefectureKey, prefectureData]) => {
              const stats = boardStats[prefectureData.jp] || {
                not_yet: 0,
                not_yet_dangerous: 0,
                reserved: 0,
                done: 0,
                error_wrong_place: 0,
                error_damaged: 0,
                error_wrong_poster: 0,
                other: 0,
              };
              const registeredInPrefecture = Object.values(stats).reduce(
                (sum, count) => sum + count,
                0,
              );
              const actualTotalInPrefecture =
                totalsByPrefecture[prefectureData.jp] || 0;
              const completionRate = getCompletionRate(
                prefectureData.jp,
                stats,
              );

              return (
                <Link
                  key={prefectureKey}
                  href={`/map/poster/${prefectureKey}`}
                  className="block"
                >
                  <Card className="transition-all hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">
                              {prefectureData.jp}
                            </CardTitle>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            掲示板数: {registeredInPrefecture.toLocaleString()}
                            {actualTotalInPrefecture > 0 && (
                              <span className="text-xs">
                                {" "}
                                (選管公表数:{" "}
                                {actualTotalInPrefecture.toLocaleString()})
                              </span>
                            )}
                          </span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats).map(([status, count]) => {
                            if (count === 0) return null;
                            const config = statusConfig[status as BoardStatus];
                            return (
                              <div
                                key={status}
                                className="flex items-center gap-1"
                              >
                                <div
                                  className={`h-2 w-2 rounded-full ${config.color}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {config.label}: {count.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            },
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" asChild>
          <Link href="/#featured-missions">
            ミッション一覧に戻る
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
