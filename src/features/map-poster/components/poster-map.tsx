"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "../styles/poster-map.css";
import "../styles/poster-map-filter.css";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { Expand, Minimize } from "lucide-react";
import {
  type PosterPrefectureKey,
  getPrefectureDefaultZoom,
} from "../constants/poster-prefectures";
import { usePosterBoardFilter } from "../hooks/use-poster-board-filter";
import { PosterBoardFilter } from "./poster-board-filter";

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

interface PosterMapProps {
  boards: PosterBoard[];
  onBoardClick: (board: PosterBoard) => void;
  center: [number, number];
  prefectureKey?: PosterPrefectureKey;
}

// Status colors for markers
const statusColors: Record<BoardStatus, string> = {
  not_yet: "#6B7280", // gray
  not_yet_dangerous: "#6B7280", // gray
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

export default function PosterMap({
  boards,
  onBoardClick,
  center,
  prefectureKey,
}: PosterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const currentMarkerRef = useRef<L.Marker | L.CircleMarker | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch current user and board info
  useEffect(() => {
    let isMounted = true;
    const fetchUserAndBoardInfo = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          return;
        }

        if (isMounted) {
          setCurrentUserId(user?.id);
        }
      } catch (error) {
        // エラーは静かに処理
      }
    };

    fetchUserAndBoardInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  // Use filter hook
  const {
    filterState,
    filteredBoards,
    toggleStatus,
    toggleShowOnlyMine,
    selectAll,
    deselectAll,
    activeFilterCount,
  } = usePosterBoardFilter({
    boards,
    currentUserId,
  });

  useEffect(() => {
    // Get zoom level for the prefecture
    const zoomLevel = prefectureKey
      ? getPrefectureDefaultZoom(prefectureKey)
      : 12;

    if (!mapRef.current) {
      // Initialize map with calculated zoom
      mapRef.current = L.map("poster-map").setView(center, zoomLevel);

      // Add tile layer (using GSI tiles)
      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }
    // Update map view when center changes
    if (mapRef.current) {
      mapRef.current.setView(center, zoomLevel);
    }
  }, [center, prefectureKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 予期せぬタイミングでの再レンダリングによってマップの位置が変わるのを避けるため、依存配列を最低限にしています
  useEffect(() => {
    // Clear existing markers
    for (const marker of markersRef.current) {
      marker.remove();
    }
    markersRef.current = [];

    // Add markers for each board (use filtered boards)
    for (const board of filteredBoards) {
      if (mapRef.current) {
        const marker = L.marker([board.lat ?? 0, board.long ?? 0], {
          icon: createMarkerIcon(board.status),
        })
          .addTo(mapRef.current)
          .bindTooltip(
            `${board.number ? `#${board.number} ` : ""}${board.name}<br/>${board.address}<br/>${board.city}`,
            { permanent: false, direction: "top" },
          )
          .on("click", () => onBoardClick(board));

        markersRef.current.push(marker);
      }
    }

    // Cleanup function
    return () => {
      for (const marker of markersRef.current) {
        marker.remove();
      }
    };
  }, [filteredBoards]);

  // 画面を開いた瞬間から現在地をwatchし、移動に追従
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // 位置情報の取得に失敗した場合は静かに処理
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 現在地マーカーの管理
  useEffect(() => {
    if (!mapRef.current) return;

    // 既存の現在地マーカーを削除
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }

    // 現在地が取得できていればマーカーを追加
    if (currentPos) {
      const marker = L.circleMarker(currentPos, {
        radius: 12,
        color: "#2563eb",
        fillColor: "#60a5fa",
        fillOpacity: 0.7,
        weight: 3,
      })
        .addTo(mapRef.current)
        .bindTooltip("あなたの現在地", { permanent: false, direction: "top" });

      currentMarkerRef.current = marker;
    }
  }, [currentPos]);

  // 現在地取得ボタンのハンドラ
  const handleLocate = () => {
    if (currentPos && mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setView(currentPos, currentZoom);
    }
  };

  // フルスクリーンモードの切り替え
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ESCキーでフルスクリーン解除
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      // フルスクリーン時はbodyのスクロールを無効化
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // フルスクリーン時に地図サイズを更新
  // biome-ignore lint/correctness/useExhaustiveDependencies: mapRefは安定した参照のため依存配列に含める必要なし
  useEffect(() => {
    if (mapRef.current) {
      // 少し遅延を入れてから地図サイズを更新
      const timeoutId = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isFullscreen]);

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen bg-white"
          : "relative h-[600px] w-full z-0"
      }
    >
      <div id="poster-map" className="h-full w-full" />
      <PosterBoardFilter
        filterState={filterState}
        onToggleStatus={toggleStatus}
        onToggleShowOnlyMine={toggleShowOnlyMine}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        activeFilterCount={activeFilterCount}
      />

      {/* フルスクリーンボタン */}
      {!isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute left-4 bottom-4 rounded-full shadow-sm px-3 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          style={{ zIndex: 1000 }}
          aria-label="フルスクリーン表示"
          title="フルスクリーン表示"
        >
          <Expand size={20} />
        </button>
      )}

      {/* フルスクリーン解除ボタン */}
      {isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute left-4 bottom-4 rounded-full shadow-sm px-3 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          style={{ zIndex: 1000 }}
          aria-label="フルスクリーン解除"
          title="フルスクリーン解除 (ESC)"
        >
          <Minimize size={20} />
        </button>
      )}

      {/* 現在地ボタン */}
      <button
        type="button"
        onClick={handleLocate}
        disabled={!currentPos}
        className={`absolute right-4 bottom-4 rounded-full shadow px-4 py-2 font-bold border transition-colors ${
          currentPos
            ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
        style={{ zIndex: 1000 }}
        aria-label="現在地を表示"
      >
        📍 現在地
      </button>
    </div>
  );
}
