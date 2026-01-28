"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { achieveMissionAction } from "@/features/mission-detail/actions/actions";
import { Archive, ArrowLeft, Copy, HelpCircle, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { statusConfig } from "../config/status-config";
import { JP_TO_EN_DISTRICT } from "../constants/poster-district-shugin-2026";
import {
  JP_TO_EN_PREFECTURE,
  type PosterPrefectureKey,
} from "../constants/poster-prefectures";
import {
  POSTER_MISSION_SLUG,
  checkBoardMissionCompleted,
  getArchivedPosterBoardsMinimal,
  getCurrentUserId,
  getPosterBoardDetail,
  getPosterBoardsMinimal,
  getPosterBoardsMinimalByDistrict,
  getPosterMissionId,
  updateBoardStatus,
} from "../services/poster-boards";
import type {
  BoardStats,
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
  StatusHistory,
} from "../types/poster-types";
import {
  calculateProgressRate,
  getCompletedCount,
} from "../utils/poster-progress";

// Dynamic import to avoid SSR issues
const PosterMap = dynamic(() => import("./poster-map-with-cluster"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      地図を読み込み中...
    </div>
  ),
});

import {
  getBoardStatusHistoryAction,
  getPosterBoardStatsAction,
  getPosterBoardStatsByDistrictAction,
  getUserEditedBoardIdsAction,
  getUserEditedBoardIdsByDistrictAction,
} from "../actions/poster-boards";

interface DetailedPosterMapClientProps {
  userId?: string;
  prefecture: string;
  prefectureName: string;
  center: [number, number];
  initialStats?: BoardStats;
  boardTotal?: PosterBoardTotal | null;
  userEditedBoardIds?: string[];
  defaultZoom?: number;
  isDistrict?: boolean;
  isArchive?: boolean;
  archiveElectionTerm?: string;
  archiveTermName?: string;
}

export default function DetailedPosterMapClient({
  userId,
  prefecture,
  prefectureName,
  center,
  initialStats,
  boardTotal,
  userEditedBoardIds,
  defaultZoom,
  isDistrict = false,
  isArchive = false,
  archiveElectionTerm,
  archiveTermName,
}: DetailedPosterMapClientProps) {
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
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [filters, setFilters] = useState({
    selectedStatuses: [
      "not_yet",
      "not_yet_dangerous",
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
  const [putUpPosterMissionId, setPutUpPosterMissionId] = useState<
    string | null
  >(null);

  // ポスター貼りミッションのミッションIDを取得
  useEffect(() => {
    const fetchMissionId = async () => {
      const missionId = await getPosterMissionId();
      setPutUpPosterMissionId(missionId);
    };
    fetchMissionId();
  }, []);

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
          setIsUpdateDialogOpen(true);

          // 使用済みのデータをクリア
          localStorage.removeItem("selectedBoardId");
          localStorage.removeItem("selectedBoardPrefecture");
        }
      }
    }
  }, [userId, boards, prefecture]);

  // ダイアログが開いたときに履歴を自動読み込み
  useEffect(() => {
    if (isUpdateDialogOpen && selectedBoard && userId) {
      const loadHistoryOnOpen = async () => {
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
      loadHistoryOnOpen();
    }
  }, [isUpdateDialogOpen, selectedBoard, userId]);

  // クリップボードにコピー
  const copyToClipboard = async (text: string, label = "内容") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}をコピーしました`);
    } catch (error) {
      toast.error("コピーに失敗しました");
    }
  };

  const loadBoards = async () => {
    try {
      // 最小限のデータのみ取得
      let data: Pick<
        PosterBoard,
        | "id"
        | "lat"
        | "long"
        | "status"
        | "name"
        | "address"
        | "city"
        | "number"
      >[];
      if (isArchive && archiveElectionTerm) {
        // アーカイブモードの場合
        data = await getArchivedPosterBoardsMinimal(
          archiveElectionTerm,
          prefecture,
        );
      } else if (isDistrict) {
        data = await getPosterBoardsMinimalByDistrict(prefecture);
      } else {
        data = await getPosterBoardsMinimal(prefecture);
      }
      setBoards(data as PosterBoard[]);

      // アーカイブモードでは統計情報は初期値のみ使用（再取得しない）
      if (!isArchive) {
        // 統計情報も更新
        const newStats = isDistrict
          ? await getPosterBoardStatsByDistrictAction(prefecture)
          : await getPosterBoardStatsAction(
              prefecture as Parameters<typeof getPosterBoardStatsAction>[0],
            );
        setStats(newStats);

        // ユーザーがログインしている場合は、編集した掲示板IDも再取得
        if (userId) {
          const updatedUserEditedBoardIds = isDistrict
            ? await getUserEditedBoardIdsByDistrictAction(prefecture, userId)
            : await getUserEditedBoardIdsAction(
                prefecture as Parameters<typeof getUserEditedBoardIdsAction>[0],
                userId,
              );
          setUserEditedBoardIdsSet(new Set(updatedUserEditedBoardIds || []));
        }
      }
    } catch (error) {
      toast.error("ポスター掲示板の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleBoardSelect = async (board: PosterBoard) => {
    // アーカイブモードの場合はクリックを無視
    if (isArchive) {
      toast.info("アーカイブデータは読み取り専用です");
      return;
    }

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
    setIsUpdateDialogOpen(true);
  };

  // ミッション達成処理
  const completePosterBoardMission = async (
    board: PosterBoard,
  ): Promise<void> => {
    const missionId = await getPosterMissionId();
    if (!missionId) {
      // ミッションが見つからない場合は静かに終了
      return;
    }

    const formData = new FormData();
    formData.append("missionId", missionId);
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
        const userId = await getCurrentUserId();

        if (userId) {
          // この掲示板で既にミッション達成済みかチェック
          const hasCompleted = await checkBoardMissionCompleted(
            selectedBoard.id,
            userId,
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
    not_yet_dangerous: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
  };
  const registeredCount = stats?.totalCount || 0;
  const actualTotalCount = boardTotal?.total_count || 0;
  const totalCount = actualTotalCount > 0 ? actualTotalCount : registeredCount;
  const completedCount = getCompletedCount(statusCounts);
  const completionRate = calculateProgressRate(completedCount, registeredCount);

  // アーカイブモードの場合のバックリンク先
  const backLink =
    isArchive && archiveElectionTerm
      ? `/map/poster/archive/${archiveElectionTerm}`
      : "/map/poster";

  return (
    <div className="container mx-auto max-w-7xl space-y-3 p-3">
      {/* Archive Notice */}
      {isArchive && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Archive className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              アーカイブデータ{archiveTermName && ` - ${archiveTermName}`}
            </p>
            <p className="text-xs text-amber-700">
              このデータは読み取り専用です。ステータスの更新はできません。
            </p>
          </div>
        </div>
      )}

      {/* Header - コンパクト化 */}
      <div className="flex items-center gap-3">
        <Link href={backLink}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-lg font-bold">
            {prefectureName}のポスター掲示板
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {isArchive
              ? "アーカイブデータ（読み取り専用）"
              : userId
                ? "掲示板をクリックしてステータスを更新"
                : "ログインするとステータスを更新できます"}
          </p>
          {!isArchive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowHelpDialog(true)}
              title="使い方を見る"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Map - 最優先表示 */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <PosterMap
          boards={boards}
          onBoardClick={handleBoardSelect}
          center={center}
          prefectureKey={
            isDistrict
              ? (JP_TO_EN_DISTRICT[prefectureName] as PosterPrefectureKey)
              : (JP_TO_EN_PREFECTURE[prefectureName] as PosterPrefectureKey)
          }
          onFilterChange={setFilters}
          currentUserId={userId}
          userEditedBoardIds={userEditedBoardIdsSet}
          defaultZoom={defaultZoom}
        />
      </div>

      {/* 統計情報とステータス - 統合版 */}
      <div className="rounded-lg border bg-card p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* 主要統計 */}
          <div className="flex items-baseline gap-4">
            <div className="flex items-baseline gap-1">
              {actualTotalCount > 0 && (
                <span className="text-2xl font-bold">{registeredCount}</span>
              )}
              <span className="text-xs text-muted-foreground">総数</span>
              <span className="text-xs text-muted-foreground">
                (公表: {totalCount})
              </span>
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
            {(
              [
                "not_yet",
                "not_yet_dangerous",
                "reserved",
                "done",
                "error_wrong_poster",
                "other",
              ] as BoardStatus[]
            ).map((status) => {
              const config = statusConfig[status];
              const count = statusCounts[status] || 0;
              return (
                <div key={status} className="flex items-center gap-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${config.color}`}
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

        {/* 予約/完了一覧リンク */}
        {isDistrict && !isArchive && (
          <div className="mt-3 pt-3 border-t">
            <Link
              href={`/map/poster/${JP_TO_EN_DISTRICT[prefectureName] || prefectureName.toLowerCase().replace(/[^a-z0-9]/g, "-")}/reservations`}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              予約/完了一覧を見る
            </Link>
          </div>
        )}
      </div>

      {/* ミッション「選挙区ポスターを貼ろう」への誘導 */}
      <div className="max-w-xl mx-auto mt-4 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-gray-800 text-sm">
        <p>
          「ポスターマップ上に掲示板が見当たらない」「ポスターを貼ったがポイントに反映されなかった」などの問題がある場合は、下記のミッションにて報告をお願いいたします👇
        </p>
        <p className="mt-2">
          <a
            href={`/missions/${POSTER_MISSION_SLUG}`}
            className="text-blue-700 underline font-bold"
          >
            🔗 ミッション「選挙区ポスターを貼ろう」
          </a>
        </p>
        <p className="mt-2">ご協力ありがとうございます！</p>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ポスターの状況を報告</DialogTitle>
            <DialogDescription>
              {selectedBoard?.name ||
                selectedBoard?.address ||
                selectedBoard?.number}
              の状況を教えてください
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground">
              {selectedBoard?.name ||
                selectedBoard?.address ||
                selectedBoard?.number}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                const text =
                  selectedBoard?.name ||
                  selectedBoard?.address ||
                  selectedBoard?.number;
                if (text) copyToClipboard(text, "名称");
              }}
              title="名称をコピー"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          {selectedBoard && (
            <div className="mb-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>
                    {selectedBoard.city} {selectedBoard.address} (
                    {selectedBoard.number})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      const address = `${selectedBoard.city} ${selectedBoard.address}`;
                      copyToClipboard(address, "住所");
                    }}
                    title="住所をコピー"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      地図で開く
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={
                          selectedBoard.lat && selectedBoard.long
                            ? `https://www.google.com/maps?q=${selectedBoard.lat},${selectedBoard.long}`
                            : `https://www.google.com/maps/search/${encodeURIComponent(
                                `${selectedBoard.city}${selectedBoard.address}`,
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center w-full"
                      >
                        Google Maps
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={
                          selectedBoard.lat && selectedBoard.long
                            ? `maps://maps.apple.com/?q=${selectedBoard.lat},${selectedBoard.long}`
                            : `maps://maps.apple.com/?q=${encodeURIComponent(
                                `${selectedBoard.city}${selectedBoard.address}`,
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center w-full"
                      >
                        Apple Maps
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">ポスターの状況</Label>
              <Select
                value={updateStatus}
                onValueChange={(value: string) =>
                  setUpdateStatus(value as BoardStatus)
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "not_yet",
                      "reserved",
                      "done",
                      "not_yet_dangerous",
                      "error_wrong_poster",
                      "other",
                    ] as BoardStatus[]
                  ).map((status) => {
                    const config = statusConfig[status];
                    return (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full shrink-0 ${config.color}`}
                          />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
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
          <div className="border-t pt-4 mt-4 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">更新履歴</h3>
              {selectedBoard && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>ID: {selectedBoard.id}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => copyToClipboard(selectedBoard.id, "ID")}
                    title="IDをコピー"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            {loadingHistory ? (
              <div className="text-sm text-muted-foreground">読み込み中...</div>
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
                      {item.user?.name && (
                        <span className="ml-2">by {item.user.name}</span>
                      )}
                      {item.note && (
                        <span className="ml-2">「{item.note}」</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2">
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
                const key = isDistrict
                  ? JP_TO_EN_DISTRICT[prefectureName] ||
                    prefectureName.toLowerCase().replace(/[^a-z0-9]/g, "-")
                  : JP_TO_EN_PREFECTURE[prefectureName];
                const returnUrl = `/map/poster/${key}`;
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
                      className={`h-3 w-3 rounded-full shrink-0 mt-0.5 ${config.color}`}
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
