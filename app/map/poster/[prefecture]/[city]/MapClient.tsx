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
  getBoardStatusHistory,
  updateBoardStatus,
} from "@/lib/services/poster-boards";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { History } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import "./poster-map.css";

// Fix Leaflet default marker icon issue with Next.js
// biome-ignore lint/performance/noDelete: Required for Leaflet icon fix
// biome-ignore lint/suspicious/noExplicitAny: Leaflet internal API
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type PosterBoard = Database["public"]["Tables"]["poster_boards"]["Row"];
type BoardStatus = Database["public"]["Enums"]["poster_board_status"];
type StatusHistory =
  Database["public"]["Tables"]["poster_board_status_history"]["Row"] & {
    user: { id: string; name: string; address_prefecture: string } | null;
  };

interface MapClientProps {
  boards: PosterBoard[];
  center: [number, number];
  zoom: number;
  userId?: string;
}

// Status configuration
const statusConfig: Record<BoardStatus, { label: string; color: string }> = {
  not_yet: { label: "未着手", color: "bg-gray-500" },
  reserved: { label: "予約済み", color: "bg-yellow-500" },
  done: { label: "完了", color: "bg-green-500" },
  error_wrong_place: { label: "場所間違い", color: "bg-red-500" },
  error_damaged: { label: "破損", color: "bg-red-500" },
  error_wrong_poster: { label: "ポスター間違い", color: "bg-red-500" },
  other: { label: "その他", color: "bg-purple-500" },
};

// Status colors for markers
const statusColors: Record<BoardStatus, string> = {
  not_yet: "#6B7280", // gray
  reserved: "#F59E0B", // yellow/orange
  done: "#10B981", // green
  error_wrong_place: "#EF4444", // red
  error_damaged: "#EF4444", // red
  error_wrong_poster: "#EF4444", // red
  other: "#8B5CF6", // purple
};

// Create custom marker icon with status color
function createMarkerIcon(status: BoardStatus) {
  const color = statusColors[status];

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "custom-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function MapClient({ boards, center, zoom, userId }: MapClientProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [selectedBoard, setSelectedBoard] = useState<PosterBoard | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<BoardStatus>("not_yet");
  const [updateNote, setUpdateNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleBoardClick = useCallback(
    (board: PosterBoard) => {
      if (!userId) {
        toast.info("ステータスを更新するにはログインが必要です");
        return;
      }
      setSelectedBoard(board);
      setUpdateStatus(board.status);
      setUpdateNote("");
      setHistory([]);
      setShowHistory(false);
      setIsUpdateDialogOpen(true);
    },
    [userId],
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current && mapContainerRef.current) {
      try {
        // Initialize map
        mapRef.current = L.map(mapContainerRef.current).setView(
          center,
          zoom || 12,
        );

        // Add tile layer (using GSI tiles)
        L.tileLayer(
          "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
          {
            attribution:
              '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
            maxZoom: 18,
          },
        ).addTo(mapRef.current);
      } catch (error) {
        console.error("Error creating map:", error);
      }
    }
    // Update map view when center changes
    if (mapRef.current) {
      mapRef.current.setView(center, zoom || 12);
    }
  }, [center, zoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Add/update markers
  useEffect(() => {
    // Clear existing markers
    for (const marker of markersRef.current) {
      marker.remove();
    }
    markersRef.current = [];

    // Add new markers
    if (mapRef.current) {
      for (const board of boards) {
        if (board.lat && board.long) {
          const marker = L.marker([board.lat, board.long], {
            icon: createMarkerIcon(board.status),
          })
            .addTo(mapRef.current)
            .bindTooltip(
              `${board.number ? `#${board.number} ` : ""}${board.name}<br/>${board.address}<br/>${board.city}`,
              { permanent: false, direction: "top" },
            )
            .on("click", () => handleBoardClick(board));

          markersRef.current.push(marker);
        }
      }
    }

    // Cleanup function
    return () => {
      for (const marker of markersRef.current) {
        marker.remove();
      }
    };
  }, [boards, handleBoardClick]);

  // Load board status history
  const loadHistory = useCallback(async (boardId: string) => {
    setLoadingHistory(true);
    try {
      const data = await getBoardStatusHistory(boardId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load history:", error);
      toast.error("履歴の読み込みに失敗しました");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedBoard || !userId) return;

    setIsUpdating(true);
    try {
      await updateBoardStatus(
        selectedBoard.id,
        updateStatus,
        updateNote || undefined,
      );

      // Update local board status
      const boardIndex = boards.findIndex((b) => b.id === selectedBoard.id);
      if (boardIndex !== -1) {
        boards[boardIndex].status = updateStatus;
      }

      // Check if mission should be completed
      if (updateStatus === "done") {
        const supabase = createClient();
        const { data: achievements } = await supabase
          .from("achievements")
          .select("*")
          .eq("user_id", userId)
          .eq("mission_id", "0193b1eb-ff07-762f-a6d7-e2bb61f093f0");

        if (!achievements || achievements.length === 0) {
          // Complete the mission
          const formData = new FormData();
          formData.append("missionId", "0193b1eb-ff07-762f-a6d7-e2bb61f093f0");
          formData.append("requiredArtifactType", "POSTER");
          formData.append("posterCount", "1");
          formData.append("prefecture", selectedBoard.prefecture);
          formData.append("city", selectedBoard.city);
          formData.append("boardNumber", selectedBoard.number || "");
          formData.append("boardName", selectedBoard.name || "");
          formData.append("boardNote", updateNote || "");
          formData.append("boardId", selectedBoard.id);

          const result = await achieveMissionAction(formData);
          if (result.success) {
            toast.success("ミッションを達成しました！");
          }
        }
      }

      toast.success("ステータスを更新しました");
      setIsUpdateDialogOpen(false);

      // Refresh markers
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("ステータスの更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="h-full w-full min-h-[600px]">
        <div ref={mapContainerRef} className="poster-map-container" />
      </div>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedBoard?.number
                ? `#${selectedBoard.number} ${selectedBoard.name}`
                : selectedBoard?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedBoard?.address} ({selectedBoard?.city})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">ステータス</Label>
              <Select
                value={updateStatus}
                onValueChange={(value) => setUpdateStatus(value as BoardStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${config.color}`}
                        />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">備考 (任意)</Label>
              <Textarea
                id="note"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="備考があれば入力してください"
                rows={3}
              />
            </div>

            {/* History Section */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!showHistory && selectedBoard) {
                    loadHistory(selectedBoard.id);
                  }
                  setShowHistory(!showHistory);
                }}
                className="w-full"
              >
                <History className="mr-2 h-4 w-4" />
                {showHistory ? "履歴を隠す" : "更新履歴を表示"}
              </Button>

              {showHistory && (
                <div className="max-h-40 space-y-2 overflow-y-auto rounded border p-2">
                  {loadingHistory ? (
                    <p className="text-center text-sm text-muted-foreground">
                      読み込み中...
                    </p>
                  ) : history.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                      履歴がありません
                    </p>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        className="border-b pb-2 text-sm last:border-b-0"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              statusConfig[item.new_status].color
                            }`}
                          />
                          <span className="font-medium">
                            {statusConfig[item.new_status].label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleString("ja-JP")}
                          </span>
                        </div>
                        {item.note && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.note}
                          </p>
                        )}
                        {item.user && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            by {item.user.name} ({item.user.address_prefecture})
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
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
    </>
  );
}
