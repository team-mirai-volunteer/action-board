"use client";

import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./poster-map.css";
import "./poster-map-filter.css";
import { PosterBoardFilter } from "@/components/map/PosterBoardFilter";
import {
  type PosterPrefectureKey,
  getPrefectureDefaultZoom,
} from "@/lib/constants/poster-prefectures";
import { usePosterBoardFilterOptimized } from "@/lib/hooks/usePosterBoardFilterOptimized";
import { createClient } from "@/lib/supabase/client";
import type { PosterBoardMinimal } from "@/lib/types/poster-boards-minimal";
import type { Database } from "@/lib/types/supabase";
import { Expand, Minimize } from "lucide-react";

// Fix Leaflet default marker icon issue with Next.js
// biome-ignore lint/performance/noDelete: Required for Leaflet icon fix
// biome-ignore lint/suspicious/noExplicitAny: Leaflet internal API
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type BoardStatus = Database["public"]["Enums"]["poster_board_status"];

interface PosterMapWithClusterProps {
  boards: PosterBoardMinimal[];
  onBoardClick: (board: PosterBoardMinimal) => void;
  center: [number, number];
  prefectureKey?: PosterPrefectureKey;
  onFilterChange?: (filters: {
    selectedStatuses: BoardStatus[];
    showOnlyMine: boolean;
  }) => void;
  currentUserId?: string;
  userEditedBoardIds?: Set<string>;
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
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Extend marker interface to include board data
interface MarkerWithBoard extends L.Marker {
  boardData?: PosterBoardMinimal;
}

// Create pie chart segments for cluster using simpler approach
function createPieSegments(
  statusCounts: Record<BoardStatus, number>,
  total: number,
  size: number,
) {
  const statusOrder: BoardStatus[] = [
    "done",
    "reserved",
    "not_yet",
    "not_yet_dangerous",
    "error_wrong_place",
    "error_damaged",
    "error_wrong_poster",
    "other",
  ];

  const segments: string[] = [];
  const radius = (size - 6) / 2; // Account for border
  const center = size / 2;

  // Start from top (-90 degrees)
  let cumulativePercentage = 0;

  for (const status of statusOrder) {
    const count = statusCounts[status];
    if (count === 0) continue;

    const percentage = count / total;

    if (percentage >= 1) {
      // Full circle
      segments.push(
        `<circle cx="${center}" cy="${center}" r="${radius}" fill="${statusColors[status]}" />`,
      );
      break;
    }

    // Calculate stroke-dasharray for this segment
    const circumference = 2 * Math.PI * radius;
    const strokeLength = circumference * percentage;
    const gapLength = circumference - strokeLength;

    // Rotate the circle so this segment appears at the right position
    const rotation = cumulativePercentage * 360 - 90; // -90 to start from top

    segments.push(`
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="none"
        stroke="${statusColors[status]}"
        stroke-width="${radius * 2}"
        stroke-dasharray="${strokeLength} ${gapLength}"
        stroke-dashoffset="0"
        transform="rotate(${rotation} ${center} ${center})"
        opacity="1"
      />
    `);

    cumulativePercentage += percentage;
  }

  return segments.join("");
}

// Create custom cluster icon with pie chart
function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers() as MarkerWithBoard[];

  // Count boards by status
  const statusCounts: Record<BoardStatus, number> = {
    not_yet: 0,
    not_yet_dangerous: 0,
    reserved: 0,
    done: 0,
    error_wrong_place: 0,
    error_damaged: 0,
    error_wrong_poster: 0,
    other: 0,
  };

  for (const marker of markers) {
    const board = marker.boardData;
    if (board) {
      statusCounts[board.status]++;
    }
  }

  const size = count < 10 ? 35 : count < 100 ? 45 : 55;
  const fontSize = size < 40 ? "11px" : size < 50 ? "13px" : "15px";

  // Count non-zero statuses
  const nonZeroStatuses = Object.values(statusCounts).filter(
    (c) => c > 0,
  ).length;

  // Create pie chart if multiple statuses, otherwise use solid color
  let backgroundContent: string;
  if (nonZeroStatuses > 1) {
    const pieSegments = createPieSegments(statusCounts, count, size);
    backgroundContent = `
      <svg 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 ${size} ${size}" 
        style="
          position: absolute; 
          top: -3px; 
          left: -3px; 
          width: ${size}px; 
          height: ${size}px;
        "
      >
        ${pieSegments}
        <text 
          x="${size / 2}" 
          y="${size / 2}" 
          text-anchor="middle" 
          dominant-baseline="central" 
          fill="white" 
          font-size="${fontSize}" 
          font-weight="bold" 
          style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);"
        >${count}</text>
      </svg>
    `;
  } else {
    // Single status - use solid color
    const dominantStatus =
      (Object.entries(statusCounts).find(
        ([, c]) => c > 0,
      )?.[0] as BoardStatus) || "not_yet";
    const color = statusColors[dominantStatus];
    backgroundContent = `
      <div style="
        background-color: ${color};
        width: calc(100% + 6px);
        height: calc(100% + 6px);
        border-radius: 50%;
        position: absolute;
        top: -3px;
        left: -3px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      ">${count}</div>
    `;
  }

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
      ">
        ${backgroundContent}
      </div>
    `,
    className: "custom-cluster",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function PosterMapWithCluster({
  boards,
  onBoardClick,
  center,
  prefectureKey,
  onFilterChange,
  currentUserId: userIdFromProps,
  userEditedBoardIds,
}: PosterMapWithClusterProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const currentMarkerRef = useRef<L.CircleMarker | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    userIdFromProps,
  );
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
          // ユーザー情報の取得に失敗した場合は静かに終了
          return;
        }

        if (isMounted && !userIdFromProps) {
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
  }, [userIdFromProps]);

  // Use optimized filter hook for better performance with large datasets
  const {
    filterState,
    filteredBoards,
    toggleStatus,
    toggleShowOnlyMine,
    selectAll,
    deselectAll,
    activeFilterCount,
  } = usePosterBoardFilterOptimized({
    boards,
    currentUserId,
    userEditedBoardIds: userEditedBoardIds,
  });

  // フィルター状態が変更されたときに親コンポーネントに通知
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        selectedStatuses: Array.from(filterState.statuses),
        showOnlyMine: filterState.showOnlyMine,
      });
    }
  }, [filterState, onFilterChange]);

  useEffect(() => {
    // Get zoom level for the prefecture
    const zoomLevel = prefectureKey
      ? getPrefectureDefaultZoom(prefectureKey)
      : 12;

    if (!mapRef.current) {
      // Initialize map with calculated zoom
      mapRef.current = L.map("poster-map-cluster").setView(center, zoomLevel);

      // Add tile layer (using GSI tiles)
      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18,
      }).addTo(mapRef.current);

      // Initialize marker cluster group with optimized settings
      // 日本全国表示の場合はクラスタリング半径を大きくする
      const clusterRadius = prefectureKey === "japan" ? 80 : 50;
      markerClusterRef.current = L.markerClusterGroup({
        maxClusterRadius: clusterRadius,
        iconCreateFunction: createClusterIcon,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        chunkedLoading: false, // チャンク単位でのロードを無効化（重複の原因）
        removeOutsideVisibleBounds: true, // 表示範囲外のマーカーを削除
        animate: true, // アニメーションを有効化
        animateAddingMarkers: false, // マーカー追加時のアニメーションを無効化
        spiderfyDistanceMultiplier: 2, // スパイダリー表示時の距離を2倍に
        spiderLegPolylineOptions: { weight: 2, color: "#222", opacity: 0.5 },
      });

      // Add cluster events for tooltips
      markerClusterRef.current.on("clustermouseover", (e) => {
        const cluster = e.propagatedFrom;
        const markers = cluster.getAllChildMarkers() as MarkerWithBoard[];
        const statusCounts: Record<BoardStatus, number> = {
          not_yet: 0,
          not_yet_dangerous: 0,
          reserved: 0,
          done: 0,
          error_wrong_place: 0,
          error_damaged: 0,
          error_wrong_poster: 0,
          other: 0,
        };

        for (const marker of markers) {
          const board = marker.boardData;
          if (board) {
            statusCounts[board.status]++;
          }
        }

        const statusLabels: Record<BoardStatus, string> = {
          not_yet: "未貼付",
          not_yet_dangerous: "未貼付（危険）",
          reserved: "予約済み",
          done: "完了",
          error_wrong_place: "場所違い",
          error_damaged: "破損",
          error_wrong_poster: "ポスター違い",
          other: "その他",
        };

        const tooltipContent = Object.entries(statusCounts)
          .filter(([, count]) => count > 0)
          .map(
            ([status, count]) =>
              `${statusLabels[status as BoardStatus]}: ${count}`,
          )
          .join("<br>");

        cluster
          .bindTooltip(
            `掲示板数: ${cluster.getChildCount()}<br>${tooltipContent}`,
            {
              permanent: false,
              direction: "top",
              className: "cluster-tooltip",
            },
          )
          .openTooltip();
      });

      markerClusterRef.current.on("clustermouseout", (e) => {
        const cluster = e.propagatedFrom;
        cluster.closeTooltip();
      });

      mapRef.current.addLayer(markerClusterRef.current as unknown as L.Layer);
    }

    // Update map view when center changes
    if (mapRef.current) {
      mapRef.current.setView(center, zoomLevel);
    }
  }, [center, prefectureKey]);

  useEffect(() => {
    if (!markerClusterRef.current || !mapRef.current) return;

    // タイマーを使って少し遅延させる（マップの準備が完了するのを待つ）
    const timeoutId = setTimeout(() => {
      if (!markerClusterRef.current) return;

      console.log("=== マーカー更新開始 ===");
      console.log("filteredBoards数:", filteredBoards.length);

      // 現在のボードIDセットを作成
      const newBoardIds = new Set<string>();
      const locationGroups = new Map<string, PosterBoardMinimal[]>();

      // Add markers for each board (use filtered boards)
      for (const board of filteredBoards) {
        // サーバー側で座標がないものは除外済みなので、チェック不要
        newBoardIds.add(board.id);
        const lat = board.lat as number;
        const long = board.long as number;
        const locationKey = `${lat.toFixed(6)}_${long.toFixed(6)}`;
        if (!locationGroups.has(locationKey)) {
          locationGroups.set(locationKey, []);
        }
        const group = locationGroups.get(locationKey);
        if (group) {
          group.push(board);
        }
      }

      // 削除するマーカーを特定
      const markersToRemove: L.Marker[] = [];
      markersMapRef.current.forEach((marker, boardId) => {
        if (!newBoardIds.has(boardId)) {
          markersToRemove.push(marker);
          markersMapRef.current.delete(boardId);
        }
      });

      // 追加するマーカーを作成
      const markersToAdd: L.Marker[] = [];

      for (const boardsAtLocation of Array.from(locationGroups.values())) {
        for (let index = 0; index < boardsAtLocation.length; index++) {
          const board = boardsAtLocation[index];

          // 既存のマーカーがある場合はスキップ
          if (markersMapRef.current.has(board.id)) {
            continue;
          }

          // サーバー側で座標がないものは除外済み
          let lat = board.lat as number;
          let lng = board.long as number;

          // 同じ位置に複数のマーカーがある場合、少しずらして配置
          if (boardsAtLocation.length > 1) {
            const angle = (index * 360) / boardsAtLocation.length;
            const radius = 0.0001 + index * 0.00005; // 約10-15m程度のオフセット
            lat += radius * Math.cos((angle * Math.PI) / 180);
            lng += radius * Math.sin((angle * Math.PI) / 180);
          }

          const marker = L.marker([lat, lng], {
            icon: createMarkerIcon(board.status),
          }).on("click", () => onBoardClick(board));

          const isHoverSupported = window.matchMedia("(hover: hover)").matches;
          if (isHoverSupported) {
            // スマホではツールチップを表示しない
            marker.bindTooltip(
              `${board.number ? `#${board.number} ` : ""}${board.name}<br/>${board.address}<br/>${board.city}${
                boardsAtLocation.length > 1
                  ? `<br><small>※この位置に${boardsAtLocation.length}件のマーカーがあります</small>`
                  : ""
              }`,
              { permanent: false, direction: "top" },
            );
          }

          // Store board data in marker for cluster icon calculation
          (marker as MarkerWithBoard).boardData = board;
          markersToAdd.push(marker);
          markersMapRef.current.set(board.id, marker);
        }
      }

      // 差分更新を実行
      if (markerClusterRef.current) {
        console.log("削除するマーカー数:", markersToRemove.length);
        console.log("追加するマーカー数:", markersToAdd.length);

        // 削除と追加を実行
        if (markersToRemove.length > 0) {
          markerClusterRef.current.removeLayers(markersToRemove);
        }
        if (markersToAdd.length > 0) {
          markerClusterRef.current.addLayers(markersToAdd);
        }

        console.log(
          "更新後の総マーカー数:",
          markerClusterRef.current.getLayers().length,
        );
      }
    }, 50); // 遅延を短縮

    // クリーンアップ関数
    return () => {
      clearTimeout(timeoutId);
    };
  }, [filteredBoards, onBoardClick]);

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

  // Cleanup
  useEffect(() => {
    return () => {
      if (markerClusterRef.current) {
        markerClusterRef.current.clearLayers();
        if (mapRef.current) {
          mapRef.current.removeLayer(
            markerClusterRef.current as unknown as L.Layer,
          );
        }
        markerClusterRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersMapRef.current.clear();
    };
  }, []);

  // 現在地取得ボタンのハンドラ
  const handleLocate = () => {
    if (currentPos && mapRef.current) {
      mapRef.current.flyTo(currentPos, 18, {
        animate: true,
        duration: 0.8,
      });
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
          ? "fixed inset-0 z-50 bg-white"
          : "relative h-[600px] w-full z-0"
      }
      style={
        isFullscreen
          ? {
              height: "100dvh",
              width: "100dvw",
              paddingBottom: "env(safe-area-inset-bottom)",
            }
          : {}
      }
    >
      <div id="poster-map-cluster" className="h-full w-full" />

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
          className="absolute left-4 bottom-4 rounded-full shadow px-3 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
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
          className="absolute left-4 rounded-full shadow px-3 py-3 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
          style={{
            zIndex: 1000,
            bottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
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
        className={`absolute right-4 rounded-full shadow px-4 py-2 font-bold border transition-colors ${
          currentPos
            ? "bg-white text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
        style={{
          zIndex: 1000,
          bottom: isFullscreen
            ? "calc(1rem + env(safe-area-inset-bottom))"
            : "1rem",
        }}
        aria-label="現在地を表示"
      >
        📍 現在地
      </button>
    </div>
  );
}
