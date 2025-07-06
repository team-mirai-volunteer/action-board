"use client";

import { achieveMissionAction } from "@/app/missions/[id]/actions";
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
  JP_TO_EN_PREFECTURE,
  type PosterPrefectureKey,
} from "@/lib/constants/poster-prefectures";
import {
  getPosterBoardDetail,
  getPosterBoardsMinimal,
  updateBoardStatus,
} from "@/lib/services/poster-boards";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { ArrowLeft, HelpCircle, History } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { statusConfig } from "../statusConfig";

// Dynamic import to avoid SSR issues
const PosterMap = dynamic(() => import("../PosterMapWithCluster"), {
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
    user?: { id: string; name: string; address_prefecture: string } | null;
  };

import {
  getBoardStatusHistoryAction,
  getPosterBoardStatsAction,
  getUserEditedBoardIdsAction,
} from "@/lib/actions/poster-boards";

interface PrefecturePosterMapClientProps {
  userId?: string;
  prefecture: string;
  prefectureName: string;
  center: [number, number];
  initialStats?: {
    totalCount: number;
    statusCounts: Record<BoardStatus, number>;
  };
  userEditedBoardIds?: string[];
}

export default function PrefecturePosterMapClient({
  userId,
  prefecture,
  prefectureName,
  center,
  initialStats,
  userEditedBoardIds,
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
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [filters, setFilters] = useState({
    selectedStatuses: [
      "not_yet",
      "reserved",
      "done",
      "error_wrong_place",
      "error_damaged",
      "error_wrong_poster",
      "other",
    ] as BoardStatus[],
    showOnlyMine: false,
  });
  const [userEditedBoardIdsSet, setUserEditedBoardIdsSet] = useState<
    Set<string>
  >(() => {
    return new Set(userEditedBoardIds || []);
  });

  useEffect(() => {
    // 初回ロード時に全データをロード
    loadBoards();
  }, []);

  // ログイン後に選択した掲示板を復元
  useEffect(() => {
    if (userId && boards.length > 0) {
      const savedBoardId = localStorage.getItem("selectedBoardId");
      const savedPrefecture = localStorage.getItem("selectedBoardPrefecture");

      if (savedBoardId && savedPrefecture === prefecture) {
        const savedBoard = boards.find((board) => board.id === savedBoardId);
        if (savedBoard) {
          // 保存された掲示板を選択してダイアログを開く
          setSelectedBoard(savedBoard);
          setUpdateStatus(savedBoard.status);
          setUpdateNote("");
          setHistory([]);
          setShowHistory(false);
          setIsUpdateDialogOpen(true);

          // 使用済みのデータをクリア
          localStorage.removeItem("selectedBoardId");
          localStorage.removeItem("selectedBoardPrefecture");
        }
      }
    }
  }, [userId, boards, prefecture]);

  const loadBoards = async () => {
    try {
      // 最小限のデータのみ取得
      const data = await getPosterBoardsMinimal(prefecture);
      setBoards(data as PosterBoard[]);

      // 統計情報も更新
      const newStats = await getPosterBoardStatsAction(
        prefecture as Parameters<typeof getPosterBoardStatsAction>[0],
      );
      setStats(newStats);

      // ユーザーがログインしている場合は、編集した掲示板IDも再取得
      if (userId) {
        const updatedUserEditedBoardIds = await getUserEditedBoardIdsAction(
          prefecture as Parameters<typeof getUserEditedBoardIdsAction>[0],
          userId,
        );
        setUserEditedBoardIdsSet(new Set(updatedUserEditedBoardIds || []));
      }
    } catch (error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = async (board: PosterBoard) => {
    if (!userId) {
      // ログイン後に戻ってきた時のために選択した掲示板情報を保存
      localStorage.setItem("selectedBoardId", board.id);
      localStorage.setItem("selectedBoardPrefecture", prefecture);
      setSelectedBoardForLogin(board);
      setIsLoginDialogOpen(true);
      return;
    }

    // 詳細データを取得
    const fullBoardData = await getPosterBoardDetail(board.id);
    if (!fullBoardData) {
      toast.error("掲示板の詳細情報の取得に失敗しました");
      return;
    }

    setSelectedBoard(fullBoardData);
    setUpdateStatus(fullBoardData.status);
    setUpdateNote("");
    setHistory([]);
    setShowHistory(false);
    setIsUpdateDialogOpen(true);
  };

  const loadHistory = async () => {
    if (!selectedBoard || !userId) return;

    setLoadingHistory(true);
    try {
      const data = await getBoardStatusHistoryAction(selectedBoard.id);
      setHistory(data as unknown as StatusHistory[]);
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
      // ミッションが見つからない場合は静かに終了
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
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedBoard) return;

    setIsUpdating(true);
    try {
      await updateBoardStatus(selectedBoard.id, updateStatus, updateNote);

      // ステータスが「完了」に変更された場合のみミッション達成処理
      if (updateStatus === "done") {
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
            completePosterBoardMission(selectedBoard).catch(() => {
              // エラーは無視して、ステータス更新自体は成功として扱う
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

  // 統計情報を使用（初期値はサーバーから提供されたもの）
  const statusCounts = stats?.statusCounts || {
    not_yet: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
  };
  const totalCount = stats?.totalCount || 0;
  const completedCount = statusCounts.done || 0;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="container mx-auto max-w-7xl space-y-3 p-3">
      {/* Header - コンパクト化 */}
      <div className="flex items-center gap-3">
        <Link href="/map/poster">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-lg font-bold">
            {prefectureName}のポスター掲示板
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {userId
              ? "掲示板をクリックしてステータスを更新"
              : "ログインするとステータスを更新できます"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowHelpDialog(true)}
            title="使い方を見る"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Map - 最優先表示 */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <PosterMap
          boards={boards}
          onBoardClick={handleBoardSelect}
          center={center}
          prefectureKey={
            JP_TO_EN_PREFECTURE[prefectureName] as PosterPrefectureKey
          }
          onFilterChange={setFilters}
          currentUserId={userId}
          userEditedBoardIds={userEditedBoardIdsSet}
        />
      </div>

      {/* 統計情報とステータス - 統合版 */}
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* 主要統計 */}
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{totalCount}</span>
              <span className="text-xs text-muted-foreground">総数</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-600">
                {completedCount}
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
                    <span className="ml-0.5 font-semibold">{count}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ポスターの状況を報告</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name ||
                selectedBoard?.address ||
                selectedBoard?.id}
              の状況を教えてください
            </DialogDescription>
          </DialogHeader>
          {selectedBoard && (
            <div className="mb-4 text-sm text-muted-foreground">
              <div>
                {selectedBoard.city} {selectedBoard.address} ({selectedBoard.id})
              </div>
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
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${config.color}`}
                        />
                        <span>{config.label}</span>
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
                      <div className="text-muted-foreground">
                        {statusConfig[item.previous_status as BoardStatus]
                          ?.label || item.previous_status}
                        →
                        {statusConfig[item.new_status as BoardStatus]?.label ||
                          item.new_status}
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
          <DialogFooter className="gap-4">
            <Button
              variant="outline"
              onClick={() => setIsLoginDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                const prefectureKey = JP_TO_EN_PREFECTURE[
                  prefectureName
                ] as PosterPrefectureKey;
                const returnUrl = `/map/poster/${prefectureKey}`;
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

      {/* Help Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>使い方</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">地図の操作</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>地図をドラッグして移動できます</li>
                <li>ピンチ操作またはボタンでズームできます</li>
                <li>現在地ボタンで自分の位置を表示できます</li>
              </ul>
            </div>

            {userId ? (
              <div className="space-y-2">
                <h4 className="font-semibold">ポスターの状況報告</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>地図上の掲示板マーカーをタップします</li>
                  <li>ポスターの状況を選択します</li>
                  <li>必要に応じて連絡事項を入力します</li>
                  <li>「報告する」ボタンで更新完了です</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="font-semibold">ポスターの状況を報告するには</h4>
                <p className="text-sm text-muted-foreground">
                  ログインすると、掲示板をタップしてポスターの状況を報告できるようになります。
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-semibold">マーカーの色の意味</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <div key={status} className="flex items-start gap-2">
                    <div
                      className={`h-3 w-3 rounded-full flex-shrink-0 mt-0.5 ${config.color}`}
                    />
                    <span className="text-xs">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
