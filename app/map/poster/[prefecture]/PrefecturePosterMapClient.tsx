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
import type {
  BoardStats,
  BoardStatus,
  PosterBoard,
  PosterBoardTotal,
  StatusHistory,
} from "@/lib/types/poster-boards";
import {
  calculateProgressRate,
  getCompletedCount,
} from "@/lib/utils/poster-progress";
import { ArrowLeft, Copy, HelpCircle, History, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

import {
  getBoardStatusHistoryAction,
  getPosterBoardStatsAction,
  getUserEditedBoardIdsAction,
} from "@/lib/actions/poster-boards";

type MapAppType = "Google Maps" | "Gpple Maps";
type DisplayType = "address" | "coordinates" | "name";

// 表示タイプに応じて日本語テキストを生成
const getDisplayTypeText = (displayType: DisplayType) => {
  switch (displayType) {
    case "address":
      return "住所";
    case "coordinates":
      return "座標";
    case "name":
      return "名称";
    default:
      return "情報";
  }
};

interface PrefecturePosterMapClientProps {
  userId?: string;
  prefecture: string;
  prefectureName: string;
  center: [number, number];
  initialStats?: BoardStats;
  boardTotal?: PosterBoardTotal | null;
  userEditedBoardIds?: string[];
}

function generateMapUrl(
  app: MapAppType,
  lat: number,
  long: number,
  address: string,
  useCoords: boolean,
) {
  if (app === "Google Maps") {
    return useCoords
      ? `https://www.google.com/maps?q=${lat},${long}`
      : `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
  }
  return useCoords
    ? `maps://maps.apple.com/?q=${lat},${long}`
    : `maps://maps.apple.com/?q=${encodeURIComponent(address)}`;
}

function LocationInfo({
  selectedBoard,
  displayType,
  preferredMapApp,
  saveMapAppPreference,
  copyToClipboard,
  onNameConfirm,
}: {
  selectedBoard: PosterBoard;
  displayType: DisplayType;
  preferredMapApp: MapAppType | null;
  saveMapAppPreference: (app: MapAppType) => void;
  copyToClipboard: (displayType: DisplayType, text: string) => Promise<void>;
  onNameConfirm: (app: MapAppType) => void;
}) {
  // 表示タイプに応じてテキストを生成
  const getDisplayText = () => {
    switch (displayType) {
      case "address":
        return `${selectedBoard.city} ${selectedBoard.address} (${selectedBoard.number})`;
      case "coordinates":
        return `${selectedBoard.lat}, ${selectedBoard.long}`;
      case "name":
        return selectedBoard.name || "名称なし";
      default:
        return "";
    }
  };

  // 地図URL生成時のuseCoords判定
  const shouldUseCoords = displayType === "coordinates";
  const displayText = getDisplayText();

  return (
    <div className="mb-4 text-sm text-muted-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{displayText}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => copyToClipboard(displayType, displayText)}
            title={`${getDisplayTypeText(displayType)}をコピー`}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {preferredMapApp ? (
          displayType === "name" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => onNameConfirm(preferredMapApp)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              {`${getDisplayTypeText(displayType)}で開く`}
            </Button>
          ) : (
            <a
              href={generateMapUrl(
                preferredMapApp,
                selectedBoard.lat,
                selectedBoard.long,
                displayText,
                shouldUseCoords,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-8 px-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent hover:bg-accent/50 rounded-md transition-colors"
            >
              <MapPin className="h-4 w-4 mr-1" />
              {`${getDisplayTypeText(displayType)}で開く`}
            </a>
          )
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MapPin className="h-4 w-4 mr-1" />
                {`${getDisplayTypeText(displayType)}で開く`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["Google Maps", "Apple Maps"].map((app) => (
                <DropdownMenuItem asChild key={app}>
                  {displayType === "name" ? (
                    <button
                      type="button"
                      className="flex items-center w-full px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onClick={() => {
                        saveMapAppPreference(app as MapAppType);
                        onNameConfirm(app as MapAppType);
                      }}
                    >
                      {app}
                    </button>
                  ) : (
                    <a
                      href={generateMapUrl(
                        app as MapAppType,
                        selectedBoard.lat,
                        selectedBoard.long,
                        displayText,
                        shouldUseCoords,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center w-full px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      onClick={() => saveMapAppPreference(app as MapAppType)}
                    >
                      {app}
                    </a>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

const TextSelector = ({
  text,
  onSelectionChange,
}: {
  text: string;
  onSelectionChange?: (selectedText: string) => void;
}) => {
  const selectableAreaRef = useRef<HTMLDivElement>(null);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const initialText = text;

  const [selection, setSelection] = useState({
    start: 0,
    end: initialText.length - 1,
  });
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [handlePositions, setHandlePositions] = useState<{
    start: { top: number; left: number } | null;
    end: { top: number; left: number } | null;
  }>({
    start: null,
    end: null,
  });

  const styles = {
    selectedText: {
      backgroundColor: "yellow",
      color: "black",
    },
    selectableArea: {
      position: "relative" as const,
      userSelect: "none" as const,
      cursor: "text",
    },
    selectionHandle: {
      position: "absolute" as const,
      width: "24px",
      height: "24px",
      backgroundColor: "hsl(var(--primary))",
      borderRadius: "50%",
      cursor: "pointer",
      zIndex: 1000,
    },
  };

  const textSpans = initialText.split("").map((char, index) => (
    <span
      key={`span-${index}-${char.charCodeAt(0)}`}
      ref={(el) => {
        spanRefs.current[index] = el;
      }}
      style={
        selection.start !== null &&
        index >= selection.start &&
        index <= selection.end
          ? styles.selectedText
          : {}
      }
    >
      {char}
    </span>
  ));

  const findSpanIndexFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const closest = { index: -1, distance: Number.POSITIVE_INFINITY };
      for (let i = 0; i < spanRefs.current.length; i++) {
        const span = spanRefs.current[i];
        if (span) {
          const rect = span.getBoundingClientRect();
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            return i;
          }
          const midX = rect.left + rect.width / 2;
          const midY = rect.top + rect.height / 2;
          const dist = Math.hypot(midX - clientX, midY - clientY);
          if (dist < closest.distance) {
            closest.distance = dist;
            closest.index = i;
          }
        }
      }
      return closest.distance < 50 ? closest.index : -1;
    },
    [],
  );

  const updateSelection = useCallback(
    (startIndex: number, endIndex: number) => {
      const newStart = Math.min(startIndex, endIndex);
      const newEnd = Math.max(startIndex, endIndex);
      setSelection({ start: newStart, end: newEnd });

      if (onSelectionChange) {
        const selectedText = initialText.slice(newStart, newEnd + 1);
        onSelectionChange(selectedText);
      }
    },
    [initialText, onSelectionChange],
  );

  const handleInteractionStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (
        e.target instanceof Element &&
        e.target.classList.contains("selection-handle-class")
      ) {
        setActiveHandle(e.target.getAttribute("data-handle"));
      }
    },
    [],
  );

  const handleInteractionMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!activeHandle) return;
      if (e.cancelable) e.preventDefault();

      const clientX = "clientX" in e ? e.clientX : e.touches?.[0]?.clientX;
      const clientY = "clientY" in e ? e.clientY : e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;
      const currentIndex = findSpanIndexFromPoint(clientX, clientY);
      if (currentIndex === -1) return;

      if (activeHandle === "start") {
        updateSelection(currentIndex, selection.end);
      } else {
        updateSelection(selection.start, currentIndex);
      }
    },
    [activeHandle, selection, findSpanIndexFromPoint, updateSelection],
  );

  const handleInteractionEnd = useCallback(() => {
    if (!activeHandle) return;
    setActiveHandle(null);
  }, [activeHandle]);

  useEffect(() => {
    document.addEventListener("mousemove", handleInteractionMove);
    document.addEventListener("touchmove", handleInteractionMove, {
      passive: false,
    });
    document.addEventListener("mouseup", handleInteractionEnd);
    document.addEventListener("touchend", handleInteractionEnd);

    return () => {
      document.removeEventListener("mousemove", handleInteractionMove);
      document.removeEventListener("touchmove", handleInteractionMove);
      document.removeEventListener("mouseup", handleInteractionEnd);
      document.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [handleInteractionMove, handleInteractionEnd]);

  useEffect(() => {
    if (selection.start === null || !selectableAreaRef.current) {
      setHandlePositions({ start: null, end: null });
      return;
    }

    const areaRect = selectableAreaRef.current.getBoundingClientRect();
    const startSpan = spanRefs.current[selection.start];
    const endSpan = spanRefs.current[selection.end];

    if (startSpan && endSpan) {
      const startSpanRect = startSpan.getBoundingClientRect();
      const endSpanRect = endSpan.getBoundingClientRect();

      setHandlePositions({
        start: {
          top: startSpanRect.bottom - areaRect.top,
          left: startSpanRect.left - areaRect.left - 12,
        },
        end: {
          top: endSpanRect.bottom - areaRect.top,
          left: endSpanRect.right - areaRect.left - 12,
        },
      });
    }
  }, [selection]);

  return (
    <div className="w-full">
      <div
        ref={selectableAreaRef}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        style={styles.selectableArea}
        className="break-words leading-relaxed text-sm sm:text-base"
      >
        {textSpans}
        {handlePositions.start && (
          <div
            className="selection-handle-class"
            data-handle="start"
            style={{
              ...styles.selectionHandle,
              top: handlePositions.start.top,
              left: handlePositions.start.left,
            }}
          />
        )}
        {handlePositions.end && (
          <div
            className="selection-handle-class"
            data-handle="end"
            style={{
              ...styles.selectionHandle,
              top: handlePositions.end.top,
              left: handlePositions.end.left,
            }}
          />
        )}
      </div>
    </div>
  );
};

function NameConfirmDialog({
  open,
  onOpenChange,
  selectedBoard,
  addressConfirmApp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBoard: PosterBoard | null;
  addressConfirmApp: MapAppType | null;
}) {
  const defaultText = selectedBoard?.name || "名称なし";
  const [selectedText, setSelectedText] = useState(defaultText);

  // selectedBoardが変更されたときにselectedTextを更新
  useEffect(() => {
    setSelectedText(defaultText);
  }, [defaultText]);

  const mapUrl =
    addressConfirmApp && selectedBoard
      ? generateMapUrl(
          addressConfirmApp,
          selectedBoard.lat,
          selectedBoard.long,
          selectedText,
          false,
        )
      : "#";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>どの範囲で検索しますか？</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            丸を動かして範囲を選択してください
          </p>
          <div className="p-4 border rounded-lg bg-muted/50">
            <TextSelector
              text={defaultText}
              onSelectionChange={setSelectedText}
            />
          </div>
        </div>
        <DialogFooter className="gap-4 top-10 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            キャンセル
          </Button>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center justify-center w-full sm:w-auto h-10 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            マップを開く
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PrefecturePosterMapClient({
  userId,
  prefecture,
  prefectureName,
  center,
  initialStats,
  boardTotal,
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
  const [showAddressConfirmDialog, setShowAddressConfirmDialog] =
    useState(false);
  const [addressConfirmApp, setAddressConfirmApp] = useState<MapAppType | null>(
    null,
  );
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
  const [putUpPosterMissionId, setPutUpPosterMissionId] = useState<
    string | null
  >(null);

  const [preferredMapApp, setPreferredMapApp] = useState<MapAppType | null>(
    null,
  );
  // 地図アプリの選択をlocalStorageから読み込み
  useEffect(() => {
    const saved = localStorage.getItem("preferredMapApp");
    if (saved === "Google Maps" || saved === "Apple Maps") {
      setPreferredMapApp(saved as MapAppType);
    }
  }, []);

  // 地図アプリの選択を保存
  const saveMapAppPreference = (app: MapAppType) => {
    setPreferredMapApp(app);
    localStorage.setItem("preferredMapApp", app);
  };

  // 地図アプリの選択をリセット
  const resetMapAppPreference = () => {
    setPreferredMapApp(null);
    localStorage.removeItem("preferredMapApp");
  };

  // ポスター貼りミッションのミッションIDを取得
  useEffect(() => {
    const fetchMissionId = async () => {
      try {
        const supabase = createClient();
        const { data: mission } = await supabase
          .from("missions")
          .select("id")
          .eq("slug", "put-up-poster-on-board")
          .single();
        setPutUpPosterMissionId(mission?.id ?? null);
      } catch (error) {
        console.error("ミッションIDの取得に失敗しました:", error);
        setPutUpPosterMissionId(null);
      }
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
          setShowHistory(false);
          setIsUpdateDialogOpen(true);

          // 使用済みのデータをクリア
          localStorage.removeItem("selectedBoardId");
          localStorage.removeItem("selectedBoardPrefecture");
        }
      }
    }
  }, [userId, boards, prefecture]);

  // 住所をクリップボードにコピー
  const copyToClipboard = async (displayType: DisplayType, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${getDisplayTypeText(displayType)}をコピーしました`);
    } catch (error) {
      toast.error("コピーに失敗しました");
    }
  };

  // 名称確認モーダルを開く
  const handleNameConfirm = (app: MapAppType) => {
    setAddressConfirmApp(app);
    setShowAddressConfirmDialog(true);
  };

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
      .select(
        `
        id,
        mission_artifacts!inner(
          achievements!inner(
            mission_id,
            user_id
          )
        )
      `,
      )
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
  const registeredCount = stats?.totalCount || 0;
  const actualTotalCount = boardTotal?.total_count || 0;
  const totalCount = actualTotalCount > 0 ? actualTotalCount : registeredCount;
  const completedCount = getCompletedCount(statusCounts);
  const completionRate = calculateProgressRate(completedCount, registeredCount);

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
              {actualTotalCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  (登録: {registeredCount})
                </span>
              )}
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

      {/* ミッション「選挙区ポスターを貼ろう」への誘導 */}
      <div className="max-w-xl mx-auto mt-4 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-gray-800 text-sm">
        <p>
          「ポスターマップ上に掲示板が見当たらない」「ポスターを貼ったがポイントに反映されなかった」などの問題がある場合は、下記のミッションにて報告をお願いいたします👇
        </p>
        <p className="mt-2">
          {putUpPosterMissionId ? (
            <a
              href={`/missions/${putUpPosterMissionId}`}
              className="text-blue-700 underline font-bold"
            >
              🔗 ミッション「選挙区ポスターを貼ろう」
            </a>
          ) : (
            <span
              className="text-gray-400 font-bold cursor-not-allowed"
              title="ミッションページが見つかりません"
            >
              🔗
              ミッションページが見つかりません。ご意見箱からご報告いただけると幸いです🙇
            </span>
          )}
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
          {selectedBoard && (
            <>
              <LocationInfo
                selectedBoard={selectedBoard}
                displayType="name"
                preferredMapApp={preferredMapApp}
                saveMapAppPreference={saveMapAppPreference}
                copyToClipboard={copyToClipboard}
                onNameConfirm={handleNameConfirm}
              />
              <LocationInfo
                selectedBoard={selectedBoard}
                displayType="address"
                preferredMapApp={preferredMapApp}
                saveMapAppPreference={saveMapAppPreference}
                copyToClipboard={copyToClipboard}
                onNameConfirm={handleNameConfirm}
              />
              <LocationInfo
                selectedBoard={selectedBoard}
                displayType="coordinates"
                preferredMapApp={preferredMapApp}
                saveMapAppPreference={saveMapAppPreference}
                copyToClipboard={copyToClipboard}
                onNameConfirm={handleNameConfirm}
              />
            </>
          )}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetMapAppPreference}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline"
            >
              デフォルトのマップアプリをリセット
            </Button>
          </div>
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

      <NameConfirmDialog
        open={showAddressConfirmDialog}
        onOpenChange={setShowAddressConfirmDialog}
        selectedBoard={selectedBoard}
        addressConfirmApp={addressConfirmApp}
      />
    </div>
  );
}
