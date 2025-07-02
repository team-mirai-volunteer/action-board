"use client";

import { achieveMissionAction } from "@/app/missions/[id]/actions";
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
  JP_TO_EN_PREFECTURE,
  type PosterPrefectureKey,
} from "@/lib/constants/poster-prefectures";
import {
  getBoardStatusHistory,
  getPosterBoards,
  updateBoardStatus,
} from "@/lib/services/poster-boards";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { ArrowLeft, History } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { statusConfig } from "../statusConfig";

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
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type StatusHistory =
  Database["public"]["Tables"]["poster_board_status_history"]["Row"] & {
    user: { id: string; name: string; address_prefecture: string } | null;
  };

interface PrefecturePosterMapClientProps {
  userId?: string;
  prefecture: string;
  prefectureName: string;
  center: [number, number];
}

export default function PrefecturePosterMapClient({
  userId,
  prefecture,
  prefectureName,
  center,
}: PrefecturePosterMapClientProps) {
  const router = useRouter();
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
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

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

  const handleBoardSelect = (board: PosterBoard) => {
    if (!userId) {
      setSelectedBoardForLogin(board);
      setIsLoginDialogOpen(true);
      return;
    }
    setSelectedBoard(board);
    setUpdateStatus(board.status);
    setUpdateNote("");
    setHistory([]);
    setShowHistory(false);
    setIsUpdateDialogOpen(true);
  };

  const loadHistory = async () => {
    if (!selectedBoard || !userId) return;

    setLoadingHistory(true);
    try {
      const data = await getBoardStatusHistory(selectedBoard.id);
      setHistory(data);
    } catch (error) {
      toast.error("履歴の読み込みに失敗しました");
    } finally {
      setLoadingHistory(false);
    }
  };

  // 掲示板でミッション達成済みかチェック
  const checkBoardMissionCompleted = async (
    boardId: string,
    userId: string,
  ): Promise<boolean> => {
    const supabase = createClient();

    // put-up-poster-on-boardミッションのIDを取得
    const { data: mission } = await supabase
      .from("missions")
      .select("id")
      .eq("slug", "put-up-poster-on-board")
      .single();

    if (!mission) return false;

    // この掲示板で既にミッション達成しているかチェック
    const { data: activities } = await supabase
      .from("poster_activities")
      .select(`
        id,
        mission_artifacts!inner(
          achievements!inner(
            mission_id,
            user_id
          )
        )
      `)
      .eq("board_id", boardId)
      .eq("mission_artifacts.achievements.user_id", userId)
      .eq("mission_artifacts.achievements.mission_id", mission.id);

    return !!(activities && activities.length > 0);
  };

  // ミッション達成処理
  const completePosterBoardMission = async (
    board: PosterBoard,
  ): Promise<void> => {
    const supabase = createClient();
    const { data: mission } = await supabase
      .from("missions")
      .select("id")
      .eq("slug", "put-up-poster-on-board")
      .single();

    if (!mission) {
      console.error("put-up-poster-on-board mission not found");
      return;
    }

    const formData = new FormData();
    formData.append("missionId", mission.id);
    formData.append("requiredArtifactType", "POSTER");
    formData.append("posterCount", "1");
    formData.append("prefecture", board.prefecture);
    formData.append("city", board.city);
    formData.append("boardNumber", board.number || "");
    formData.append("boardName", board.name || "");
    formData.append("boardNote", updateNote || "");
    formData.append("boardAddress", board.address || "");
    formData.append("boardLat", board.lat?.toString() || "");
    formData.append("boardLong", board.long?.toString() || "");
    formData.append("boardId", board.id);

    const result = await achieveMissionAction(formData);

    if (result.success) {
      toast.success(`ミッション達成！ +${result.xpGranted}XP獲得`);
    } else {
      console.error("Mission completion failed:", result.error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBoard) return;

    setIsUpdating(true);
    try {
      await updateBoardStatus(selectedBoard.id, updateStatus, updateNote);

      // ステータスが「完了」に変更された場合のみミッション達成処理
      if (updateStatus === "posted") {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // この掲示板で既にミッション達成済みかチェック
          const hasCompleted = await checkBoardMissionCompleted(
            selectedBoard.id,
            user.id,
          );

          if (!hasCompleted) {
            // ミッション達成処理を実行（非同期で実行し、失敗してもステータス更新は成功扱い）
            completePosterBoardMission(selectedBoard).catch((error) => {
              console.error("Mission completion error:", error);
              // エラーは記録するが、ステータス更新自体は成功として扱う
            });
          }
        }
      }

      toast.success("ステータスを更新しました");
      setIsUpdateDialogOpen(false);
      await loadBoards(); // Reload to get updated data
      // Clear history so it's fresh next time
      setHistory([]);
      setShowHistory(false);
    } catch (error) {
      toast.error("ステータスの更新に失敗しました");
    } finally {
      setIsUpdating(false);
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

  const stats = boards.reduce(
    (acc, board) => {
      acc[board.status] = (acc[board.status] || 0) + 1;
      return acc;
    },
    {} as Record<BoardStatus, number>,
  );

  const completedCount = (stats.posted || 0) + (stats.checked || 0);
  const totalCount = boards.length;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/map/poster">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {prefectureName}のポスター掲示板
          </h1>
          <p className="text-muted-foreground">
            {userId
              ? "掲示板をクリックしてステータスを更新できます"
              : "ログインするとステータスを更新できます"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold">{totalCount}</div>
          <div className="text-sm text-muted-foreground">総掲示板数</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {completedCount}
          </div>
          <div className="text-sm text-muted-foreground">貼付完了</div>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {completionRate}%
          </div>
          <div className="text-sm text-muted-foreground">達成率</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="space-y-2">
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = stats[status as BoardStatus] || 0;
              if (count === 0) return null;
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${config.color}`} />
                  <span className="text-sm">
                    {config.label}: {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <PosterMap
          boards={boards}
          onBoardClick={handleBoardSelect}
          center={center}
          prefectureKey={
            JP_TO_EN_PREFECTURE[prefectureName] as PosterPrefectureKey
          }
        />
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

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ポスターの状況を報告</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name}の状況を教えてください
            </DialogDescription>
          </DialogHeader>
          {selectedBoard && (
            <div className="mb-4 text-sm text-muted-foreground">
              <div>{selectedBoard.address}</div>
              <div>{selectedBoard.city}</div>
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">ポスターの状況</Label>
              <Select
                value={updateStatus}
                onValueChange={(value) => setUpdateStatus(value as BoardStatus)}
              >
                <SelectTrigger id="status">
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
              <Label htmlFor="note">連絡事項など</Label>
              <Textarea
                id="note"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="「ポスターが破れていた」「他のポスターで隠れていた」など、気づいたことを教えてください。"
                rows={3}
              />
            </div>
          </div>

          {/* History Section */}
          {showHistory && (
            <div className="border-t pt-4 mt-4 max-h-48 overflow-y-auto">
              <h3 className="font-semibold mb-2">更新履歴</h3>
              {loadingHistory ? (
                <div className="text-sm text-muted-foreground">
                  読み込み中...
                </div>
              ) : history.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  履歴がありません
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.user?.name || "不明なユーザー"}
                        </span>
                        <span className="text-muted-foreground">
                          {statusConfig[item.previous_status as BoardStatus]
                            ?.label || item.previous_status}
                          →
                          {statusConfig[item.new_status as BoardStatus]
                            ?.label || item.new_status}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(item.created_at).toLocaleString("ja-JP")}
                        {item.note && (
                          <span className="ml-2">「{item.note}」</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!showHistory) {
                  loadHistory();
                }
                setShowHistory(!showHistory);
              }}
              type="button"
            >
              <History className="mr-2 h-4 w-4" />
              これまでの報告
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                disabled={isUpdating}
              >
                キャンセル
              </Button>
              <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                {isUpdating ? "報告中..." : "報告する"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ログインが必要です</DialogTitle>
            <DialogDescription>
              ポスターの状況を更新するには、ログインが必要です。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedBoardForLogin && (
              <div className="mt-3 rounded-md bg-muted p-3">
                <p className="text-sm font-medium">
                  {selectedBoardForLogin.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedBoardForLogin.address}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLoginDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const returnUrl = `/map/poster/${prefecture}`;
                router.push(
                  `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}`,
                );
              }}
            >
              ログインページへ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
