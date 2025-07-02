import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSTER_PREFECTURE_MAP } from "@/lib/constants/poster-prefectures";
import { getPosterBoards } from "@/lib/services/poster-boards";
import type { Database } from "@/lib/types/supabase";
import { ChevronRight, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

export const metadata: Metadata = {
  title: "ポスター掲示板マップ",
  description: "チームみらいのポスター掲示板の配置状況を確認できます",
};

export default async function PosterMapPage() {
  const boards = await getPosterBoards();

  // Calculate statistics per prefecture
  const boardStats: Record<string, Record<BoardStatus, number>> = {};
  for (const board of boards) {
    if (!boardStats[board.prefecture]) {
      boardStats[board.prefecture] = {
        not_yet: 0,
        reserved: 0,
        done: 0,
        error_wrong_place: 0,
        error_damaged: 0,
        error_wrong_poster: 0,
        other: 0,
      };
    }
    boardStats[board.prefecture][board.status]++;
  }

  const totalCount = boards.length;
  const completedCount = boards.filter((b) => b.status === "done").length;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalCount}</div>
              <div className="text-sm text-muted-foreground">総掲示板数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {completedCount}
              </div>
              <div className="text-sm text-muted-foreground">貼付完了</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {completionRate}%
              </div>
              <div className="text-sm text-muted-foreground">達成率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prefecture Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(POSTER_PREFECTURE_MAP).map(([key, prefecture]) => {
          const stats = boardStats[prefecture.jp] || {};
          const total = Object.values(stats).reduce(
            (sum, count) => sum + count,
            0,
          );
          const completed = stats.done || 0;
          const percentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <Link key={key} href={`/map/poster/${key}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold">{prefecture.jp}</h3>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>掲示板数: {total}</span>
                      <span>完了: {completed}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>進捗</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
