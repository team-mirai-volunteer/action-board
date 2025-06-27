"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPosterBoards } from "@/lib/services/poster-boards";
import type { Database } from "@/lib/types/supabase";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["board_status"];

const statusConfig: Record<BoardStatus, { label: string; color: string }> = {
  not_yet: { label: "未貼付", color: "bg-gray-500" },
  posted: { label: "貼付済", color: "bg-green-500" },
  checked: { label: "確認済", color: "bg-blue-500" },
  damaged: { label: "損傷", color: "bg-red-500" },
  error: { label: "エラー", color: "bg-yellow-500" },
  other: { label: "その他", color: "bg-purple-500" },
};

// Prefecture data with coordinates for centering map
const prefectureData = [
  {
    id: "hokkaido",
    name: "北海道",
    nameEn: "Hokkaido",
    center: [43.0642, 141.3469] as [number, number],
    description: "日本最北の地",
  },
  {
    id: "miyagi",
    name: "宮城県",
    nameEn: "Miyagi",
    center: [38.2688, 140.8721] as [number, number],
    description: "東北地方の中心地",
  },
  {
    id: "saitama",
    name: "埼玉県",
    nameEn: "Saitama",
    center: [35.857, 139.649] as [number, number],
    description: "首都圏のベッドタウン",
  },
  {
    id: "chiba",
    name: "千葉県",
    nameEn: "Chiba",
    center: [35.605, 140.1233] as [number, number],
    description: "首都圏東部の要所",
  },
  {
    id: "tokyo",
    name: "東京都",
    nameEn: "Tokyo",
    center: [35.6762, 139.6503] as [number, number],
    description: "首都圏の中心地",
  },
  {
    id: "kanagawa",
    name: "神奈川県",
    nameEn: "Kanagawa",
    center: [35.4478, 139.6425] as [number, number],
    description: "首都圏南部の要所",
  },
  {
    id: "nagano",
    name: "長野県",
    nameEn: "Nagano",
    center: [36.6513, 138.181] as [number, number],
    description: "日本アルプスの地",
  },
  {
    id: "aichi",
    name: "愛知県",
    nameEn: "Aichi",
    center: [35.1802, 136.9066] as [number, number],
    description: "中部地方の中心地",
  },
  {
    id: "osaka",
    name: "大阪府",
    nameEn: "Osaka",
    center: [34.6937, 135.5023] as [number, number],
    description: "関西地方の中心地",
  },
  {
    id: "hyogo",
    name: "兵庫県",
    nameEn: "Hyogo",
    center: [34.6913, 135.1831] as [number, number],
    description: "関西地方の要所",
  },
  {
    id: "ehime",
    name: "愛媛県",
    nameEn: "Ehime",
    center: [33.8416, 132.7658] as [number, number],
    description: "四国地方西部",
  },
  {
    id: "fukuoka",
    name: "福岡県",
    nameEn: "Fukuoka",
    center: [33.5904, 130.4017] as [number, number],
    description: "九州地方の中心地",
  },
];

export default function PosterMapPageClient() {
  const [boards, setBoards] = useState<PosterBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardStats, setBoardStats] = useState<
    Record<string, Record<BoardStatus, number>>
  >({});

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await getPosterBoards();
      setBoards(data);

      // Calculate statistics per prefecture
      const stats: Record<string, Record<BoardStatus, number>> = {};
      for (const board of data) {
        if (!board.prefecture) continue;
        if (!stats[board.prefecture]) {
          stats[board.prefecture] = {
            not_yet: 0,
            posted: 0,
            checked: 0,
            damaged: 0,
            error: 0,
            other: 0,
          };
        }
        stats[board.prefecture][board.status]++;
      }
      setBoardStats(stats);
    } catch (error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = (stats: Record<BoardStatus, number>) => {
    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    const completed = stats.posted + stats.checked;
    return Math.round((completed / total) * 100);
  };

  const getTotalStats = () => {
    const total = boards.length;
    const completed = boards.filter(
      (b) => b.status === "posted" || b.status === "checked",
    ).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();

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
              <div className="text-2xl font-bold">{totalStats.total}</div>
              <div className="text-sm text-muted-foreground">総掲示板数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totalStats.completed}
              </div>
              <div className="text-sm text-muted-foreground">貼付完了</div>
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
        </CardContent>
      </Card>

      {/* Prefecture List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">都道府県から選択</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prefectureData.map((prefecture) => {
            const stats = boardStats[prefecture.id] || {
              not_yet: 0,
              posted: 0,
              checked: 0,
              damaged: 0,
              error: 0,
              other: 0,
            };
            const totalInPrefecture = Object.values(stats).reduce(
              (sum, count) => sum + count,
              0,
            );
            const completionRate = getCompletionRate(stats);

            return (
              <Link
                key={prefecture.id}
                href={`/map/poster/${prefecture.id}`}
                className="block"
              >
                <Card className="transition-all hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            {prefecture.name}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {prefecture.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          掲示板数: {totalInPrefecture}
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
                                {config.label}: {count}
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
      </div>

      {/* Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ステータス凡例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${config.color}`} />
                <span className="text-sm">{config.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button size="lg" asChild>
          <Link href="/missions">
            ミッション一覧に戻る
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
