"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getPosterBoardDetail,
  getPosterBoardsMinimal,
  updateBoardStatus,
} from "@/lib/services/poster-boards";
import type {
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
} from "@/lib/types/poster-boards";
import {
  calculateProgressRate,
  getCompletedCount,
  getRegisteredCount,
} from "@/lib/utils/poster-progress";
import { ArrowLeft, Copy, History, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { statusConfig } from "../statusConfig";

const PosterMap = dynamic(() => import("../PosterMapWithCluster"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      地図を読み込み中...
    </div>
  ),
});

interface AllJapanPosterMapClientProps {
  userId?: string;
  center: [number, number];
  defaultZoom: number;
  initialSummary: Record<
    string,
    { total: number; statuses: Record<BoardStatus, number> }
  >;
  initialTotals: PosterBoardTotal[];
}

export default function AllJapanPosterMapClient({
  userId,
  center,
  defaultZoom,
  initialSummary,
  initialTotals,
}: AllJapanPosterMapClientProps) {
  const [boards, setBoards] = useState<PosterBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<PosterBoard | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<BoardStatus>("not_yet");
  const [updateNote, setUpdateNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [selectedBoardForLogin, setSelectedBoardForLogin] =
    useState<PosterBoard | null>(null);

  const totalStats = useMemo(() => {
    const actualTotal = initialTotals.reduce(
      (sum, total) => sum + (total.city ? 0 : total.total_count),
      0,
    );

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

      for (const [status, count] of Object.entries(data.statuses)) {
        allStatuses[status as BoardStatus] += count;
      }
    }

    const percentage = calculateProgressRate(completed, registeredTotal);

    return {
      actualTotal,
      registeredTotal,
      completed,
      percentage,
      statuses: allStatuses,
    };
  }, [initialSummary, initialTotals]);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const data = await getPosterBoardsMinimal();
      setBoards(data as PosterBoard[]);
    } catch (error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = async (board: PosterBoard) => {
    if (!userId) {
      setSelectedBoardForLogin(board);
      setIsLoginDialogOpen(true);
      return;
    }

    const fullBoardData = await getPosterBoardDetail(board.id);
    if (!fullBoardData) {
      toast.error("掲示板の詳細情報の取得に失敗しました");
      return;
    }

    setSelectedBoard(fullBoardData);
    setUpdateStatus(fullBoardData.status);
    setUpdateNote("");
    setIsUpdateDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedBoard) return;

    setIsUpdating(true);
    try {
      await updateBoardStatus(selectedBoard.id, updateStatus, updateNote);
      toast.success("ステータスを更新しました");
      setIsUpdateDialogOpen(false);
      await loadBoards();
    } catch (error) {
      toast.error("ステータスの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("住所をコピーしました");
    } catch (error) {
      toast.error("コピーに失敗しました");
    }
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

  return (
    <div className="container mx-auto max-w-7xl space-y-3 p-3">
      <div className="flex items-center gap-3">
        <Link href="/map/poster">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-lg font-bold">全国ポスター掲示板マップ</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {userId
              ? "掲示板をクリックしてステータスを更新"
              : "ログインするとステータスを更新できます"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <PosterMap
          boards={boards}
          onBoardClick={handleBoardSelect}
          center={center}
          onFilterChange={() => {}}
          currentUserId={userId}
          userEditedBoardIds={new Set()}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>全国の進捗状況</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {totalStats.registeredTotal.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">総掲示板数</div>
              <div className="text-xs text-muted-foreground">
                (公表: {totalStats.actualTotal.toLocaleString()})
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

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ログインが必要です</DialogTitle>
            <DialogDescription>
              掲示板のステータスを更新するにはログインが必要です。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLoginDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button asChild>
              <Link href="/sign-in">ログイン</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>掲示板ステータス更新</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name || "掲示板"} のステータスを更新します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={updateStatus}
                onValueChange={(value) => setUpdateStatus(value as BoardStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${config.color}`}
                        />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">メモ（任意）</Label>
              <Textarea
                id="note"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="更新の詳細や注意事項があれば記入してください"
                rows={3}
              />
            </div>
            {selectedBoard && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedBoard.address}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(selectedBoard.address || "")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div>番号: {selectedBoard.number}</div>
                <div>
                  現在のステータス: {statusConfig[selectedBoard.status]?.label}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
