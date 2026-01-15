"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { statusConfig } from "../config/status-config";
import { JP_TO_EN_DISTRICT } from "../constants/poster-district-shugin-2026";
import type { BoardStatus, PosterBoardTotal } from "../types/poster-types";
import {
  calculateProgressRate,
  getCompletedCount,
  getRegisteredCount,
} from "../utils/poster-progress";

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
  // 区割り別の統計を使用
  const boardStats = useMemo(() => {
    const stats: Record<string, Record<BoardStatus, number>> = {};
    for (const [district, data] of Object.entries(initialSummary)) {
      stats[district] = data.statuses;
    }
    return stats;
  }, [initialSummary]);

  // 全体の統計を計算（登録済み掲示板数基準）
  const totalStats = useMemo(() => {
    // 全区割りの統計を集計
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
      registeredTotal, // DB登録数
      completed,
      percentage,
      statuses: allStatuses, // 各ステータスの合計
    };
  }, [initialSummary]);

  // 区割り別の完了率を計算（登録済み掲示板数基準）
  const getCompletionRate = (stats: Record<BoardStatus, number>) => {
    const registeredTotal = getRegisteredCount(stats);
    const completed = getCompletedCount(stats);
    return calculateProgressRate(completed, registeredTotal);
  };

  // DB から取得した区割りをソート（データがある区割りのみ表示）
  const sortedDistricts = useMemo(() => {
    // initialSummary のキー（区割り名）を取得してソート
    return Object.keys(initialSummary).sort((a, b) => a.localeCompare(b, "ja"));
  }, [initialSummary]);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">ポスター掲示板マップ</h1>
        <p className="text-muted-foreground">
          選挙区を選択して、各地域のポスター掲示板の状況を確認できます
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
              <div className="text-2xl font-bold">
                {totalStats.registeredTotal.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">総掲示板数</div>
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
                className="h-full bg-linear-to-r from-blue-500 to-green-500 transition-all duration-300"
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

      {/* District List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">選挙区から選択</h2>
        {sortedDistricts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              現在表示できる選挙区がありません
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedDistricts.map((districtJp) => {
              // 区割り名からURLキーを取得（DB のデータを優先）
              const districtKey =
                JP_TO_EN_DISTRICT[districtJp] ||
                districtJp.toLowerCase().replace(/[^a-z0-9]/g, "-");
              const stats = boardStats[districtJp] || {
                not_yet: 0,
                not_yet_dangerous: 0,
                reserved: 0,
                done: 0,
                error_wrong_place: 0,
                error_damaged: 0,
                error_wrong_poster: 0,
                other: 0,
              };
              const registeredInDistrict = Object.values(stats).reduce(
                (sum, count) => sum + count,
                0,
              );
              const completionRate = getCompletionRate(stats);

              return (
                <Link
                  key={districtJp}
                  href={`/map/poster/${districtKey}`}
                  className="block"
                >
                  <Card className="transition-all hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">
                              {districtJp}
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
                            掲示板数: {registeredInDistrict.toLocaleString()}
                          </span>
                          <span className="font-medium">{completionRate}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-green-500 transition-all duration-300"
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
            })}
          </div>
        )}
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

      {/* Archive Link */}
      <div className="flex justify-center pt-2 pb-4">
        <Link
          href="/map/poster/archive/sangin-2025"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          過去の選挙データを見る（参議院選挙 2025）
        </Link>
      </div>
    </div>
  );
}
