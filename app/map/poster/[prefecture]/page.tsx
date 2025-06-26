"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  getPosterBoards,
  updateBoardStatus,
} from "@/lib/services/poster-boards";
import type { Database } from "@/lib/types/supabase";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Dynamic import to avoid SSR issues
const PosterMap = dynamic(() => import("../PosterMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
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

export default function PrefecturePosterMapPage() {
  const params = useParams();
  const prefecture = decodeURIComponent(params.prefecture as string);

  const [boards, setBoards] = useState<PosterBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState<PosterBoard | null>(null);
  const [newStatus, setNewStatus] = useState<BoardStatus>("not_yet");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: prefecture is used in loadBoards
  useEffect(() => {
    loadBoards();
  }, [prefecture]);

  const loadBoards = async () => {
    try {
      const data = await getPosterBoards(prefecture);
      setBoards(data);
    } catch (error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleBoardClick = (board: PosterBoard) => {
    setSelectedBoard(board);
    setNewStatus(board.status);
    setStatusNote("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedBoard) return;

    setIsUpdating(true);
    try {
      await updateBoardStatus(selectedBoard.id, newStatus, statusNote);

      // Update local state
      setBoards(
        boards.map((b) =>
          b.id === selectedBoard.id ? { ...b, status: newStatus } : b,
        ),
      );

      setSelectedBoard(null);
      toast.success("ステータスを更新しました");
    } catch (error) {
      toast.error("ステータスの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
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
        <Link
          href="/map/poster"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          全国マップに戻る
        </Link>

        <h1 className="text-3xl font-bold mb-2">
          {prefecture}のポスター掲示板マップ
        </h1>
        <p className="text-gray-600">
          地図上のピンをクリックして、ポスターの貼付状況を更新できます。
        </p>

        {/* Status Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${config.color}`} />
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {boards.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {prefecture}にはまだポスター掲示板が登録されていません。
          </p>
        </div>
      ) : (
        <>
          {/* Map Container */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <PosterMap boards={boards} onBoardClick={handleBoardClick} />
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = boards.filter((b) => b.status === status).length;
              return (
                <div
                  key={status}
                  className="bg-white rounded-lg shadow p-4 text-center"
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-gray-600">{config.label}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Status Update Dialog */}
      <Dialog
        open={!!selectedBoard}
        onOpenChange={() => setSelectedBoard(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ステータス更新</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name}のステータスを更新します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>現在のステータス</Label>
              <div className="mt-1">
                <Badge
                  className={
                    statusConfig[selectedBoard?.status || "not_yet"].color
                  }
                >
                  {statusConfig[selectedBoard?.status || "not_yet"].label}
                </Badge>
              </div>
            </div>

            <div>
              <Label htmlFor="status">新しいステータス</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as BoardStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="note">メモ（任意）</Label>
              <Textarea
                id="note"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="例: ポスターを確認しました"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBoard(null)}>
              キャンセル
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isUpdating || newStatus === selectedBoard?.status}
            >
              {isUpdating ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
