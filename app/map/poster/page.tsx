"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSampleBoardsForPreview } from "@/lib/services/poster-boards";
import type { Database } from "@/lib/types/supabase";
import { ChevronRight, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Dynamic import to avoid SSR issues
const PosterMapPreview = dynamic(() => import("./PosterMapPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      地図を読み込み中...
    </div>
  ),
});

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
    id: "tokyo",
    name: "東京都",
    nameEn: "Tokyo",
    center: [35.6762, 139.6503] as [number, number],
    description: "首都圏の中心地",
  },
  {
    id: "osaka",
    name: "大阪府",
    nameEn: "Osaka",
    center: [34.6937, 135.5023] as [number, number],
    description: "関西の経済中心地",
  },
  {
    id: "hyogo",
    name: "兵庫県",
    nameEn: "Hyogo",
    center: [34.6413, 135.183] as [number, number],
    description: "神戸を含む多様な地域",
  },
  {
    id: "hokkaido",
    name: "北海道",
    nameEn: "Hokkaido",
    center: [43.0642, 141.3469] as [number, number],
    description: "日本最北の広大な地域",
  },
];

export default function PosterMapPage() {
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
      const data = await getSampleBoardsForPreview();
      setBoards(data);

      // Calculate statistics per prefecture
      const stats: Record<string, Record<BoardStatus, number>> = {};
      data.forEach((board) => {
        if (!board.prefecture) return;
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
      });
      setBoardStats(stats);
    } catch (error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (prefecture: string) => {
    const stats = boardStats[prefecture];
    if (!stats) return 0;

    const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const completed = stats.posted + stats.checked;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ポスター掲示板マップ</h1>
        <p className="text-gray-600">
          都道府県を選択して、各地域のポスター貼付状況を確認・更新できます。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left side - Prefecture list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            対応都道府県
          </h2>

          {prefectureData.map((prefecture) => {
            const progress = getProgressPercentage(prefecture.name);
            const stats = boardStats[prefecture.name] || {};
            const total = Object.values(stats).reduce(
              (sum, count) => sum + count,
              0,
            );

            return (
              <Card
                key={prefecture.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {prefecture.name}
                      </CardTitle>
                      <CardDescription>
                        {prefecture.description}
                      </CardDescription>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/map/poster/${encodeURIComponent(prefecture.name)}`}
                      >
                        詳細
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>掲示板数: {total}</span>
                      <span>進捗: {progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                      {Object.entries(statusConfig)
                        .slice(0, 3)
                        .map(([status, config]) => {
                          const count = stats[status as BoardStatus] || 0;
                          return (
                            <div
                              key={status}
                              className="flex items-center gap-1"
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${config.color}`}
                              />
                              <span>
                                {config.label}: {count}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              ※ 今後、さらに多くの都道府県に対応予定です。
            </p>
          </div>
        </div>

        {/* Right side - Preview map */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>全体マップ（プレビュー）</CardTitle>
              <CardDescription>
                各都道府県の掲示板位置を表示しています。詳細な操作は都道府県別マップで行ってください。
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-b-lg overflow-hidden">
                <PosterMapPreview boards={boards} />
              </div>

              {/* Status Legend */}
              <div className="p-4 border-t">
                <div className="flex flex-wrap gap-3 justify-center">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <div key={status} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${config.color}`} />
                      <span className="text-sm">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
