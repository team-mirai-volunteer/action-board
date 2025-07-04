"use client";

import {
  type FilterState,
  filterPosterBoards,
  loadBoardsForViewport,
} from "@/app/map/poster/[prefecture]/actions";
import { PosterBoardFilter } from "@/components/map/PosterBoardFilter";
import type {
  FilterStatus,
  PosterBoardFilterState,
} from "@/lib/hooks/usePosterBoardFilter";
import type { Viewport } from "@/lib/services/poster-boards-server";
import type { Database } from "@/lib/types/supabase";
import L from "leaflet";
import "leaflet.markercluster";
import { useCallback, useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./poster-map.css";
import "./poster-map-filter.css";
import { MAX_ZOOM } from "@/lib/constants";
import { toast } from "sonner";
import { statusConfig } from "./statusConfig";

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

interface MarkerWithBoard extends L.Marker {
  boardData?: PosterBoard;
}

interface PosterMapOptimizedProps {
  initialBoards: PosterBoard[];
  prefecture: string;
  onBoardClick: (board: PosterBoard) => void;
  center: [number, number];
}

// マーカーアイコンの生成関数
function createMarkerIcon(status: BoardStatus) {
  const config = statusConfig[status];
  const color = config?.color.replace("bg-", "") || "gray-500";

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div class="marker-pin ${color}"></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
}

// クラスターアイコンの生成関数
function createClusterIcon(cluster: L.MarkerCluster) {
  const markers = cluster.getAllChildMarkers() as MarkerWithBoard[];
  const statusCounts: Record<BoardStatus, number> = {
    not_yet: 0,
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

  const total = markers.length;
  const completedPercent = Math.round((statusCounts.done / total) * 100);

  let dominantStatus: BoardStatus = "not_yet";
  let maxCount = 0;
  for (const [status, count] of Object.entries(statusCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantStatus = status as BoardStatus;
    }
  }

  const config = statusConfig[dominantStatus];
  const color = config?.color.replace("bg-", "") || "gray-500";

  return L.divIcon({
    html: `<div class="cluster-icon ${color}">
      <span>${total}</span>
      <small>${completedPercent}%</small>
    </div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(40, 40),
  });
}

export default function PosterMapOptimized({
  initialBoards,
  prefecture,
  onBoardClick,
  center,
}: PosterMapOptimizedProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const [boards, setBoards] = useState<PosterBoard[]>(initialBoards);
  const [loading, setLoading] = useState(false);
  const [currentViewport, setCurrentViewport] = useState<Viewport | null>(null);
  const [filterState, setFilterState] = useState<PosterBoardFilterState>({
    statuses: new Set<FilterStatus>(),
    showOnlyMine: false,
  });
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

  // フィルター状態の変更を処理
  const handleFilterChange = useCallback(
    async (newFilterState: PosterBoardFilterState) => {
      setFilterState(newFilterState);

      // アクティブなフィルター数を計算
      const count =
        newFilterState.statuses.size + (newFilterState.showOnlyMine ? 1 : 0);
      setActiveFilterCount(count);

      if (!currentViewport) return;

      setLoading(true);
      try {
        // PosterBoardFilterStateをFilterStateに変換
        const filterStateForAction: FilterState = {
          selectedStatuses: Array.from(newFilterState.statuses),
          showOnlyMine: newFilterState.showOnlyMine,
        };

        const filteredBoards = await filterPosterBoards(
          prefecture,
          currentViewport,
          filterStateForAction,
        );
        setBoards(filteredBoards);
      } catch (error) {
        console.error("Error filtering boards:", error);
        toast.error("フィルタリングに失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [prefecture, currentViewport],
  );

  // ビューポート変更時のデータ取得
  const handleViewportChange = useCallback(async () => {
    if (!mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    const viewport: Viewport = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };

    setCurrentViewport(viewport);

    // フィルターが適用されている場合はフィルタリングも含めて取得
    if (activeFilterCount > 0) {
      setLoading(true);
      try {
        // PosterBoardFilterStateをFilterStateに変換
        const filterStateForAction: FilterState = {
          selectedStatuses: Array.from(filterState.statuses),
          showOnlyMine: filterState.showOnlyMine,
        };

        const filteredBoards = await filterPosterBoards(
          prefecture,
          viewport,
          filterStateForAction,
        );
        setBoards(filteredBoards);
      } catch (error) {
        console.error("Error loading boards:", error);
        toast.error("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    } else {
      // フィルターなしの場合は単純な範囲取得
      setLoading(true);
      try {
        const newBoards = await loadBoardsForViewport(prefecture, viewport);
        setBoards(newBoards);
      } catch (error) {
        console.error("Error loading boards:", error);
        toast.error("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
  }, [prefecture, filterState, activeFilterCount]);

  // 地図の初期化
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("poster-map-optimized").setView(center, 12);

      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: MAX_ZOOM,
      }).addTo(mapRef.current);

      // マーカークラスターグループの初期化
      markerClusterRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: createClusterIcon,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
      });

      mapRef.current.addLayer(markerClusterRef.current as unknown as L.Layer);

      // ビューポート変更イベントの設定
      mapRef.current.on("moveend", handleViewportChange);

      // 初期ビューポートの設定
      handleViewportChange();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off("moveend", handleViewportChange);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, handleViewportChange]);

  // マーカーの更新
  useEffect(() => {
    if (!markerClusterRef.current) return;

    // 既存のマーカーをクリア
    markerClusterRef.current.clearLayers();

    // 新しいマーカーを追加
    for (const board of boards) {
      if (board.lat && board.long) {
        const marker = L.marker([board.lat, board.long], {
          icon: createMarkerIcon(board.status),
        })
          .bindTooltip(
            `${board.number ? `#${board.number} ` : ""}${board.name}<br/>${board.address}<br/>${board.city}`,
            { permanent: false, direction: "top" },
          )
          .on("click", () => onBoardClick(board));

        (marker as MarkerWithBoard).boardData = board;
        markerClusterRef.current.addLayer(marker);
      }
    }

    // クラスターのツールチップイベントを追加
    markerClusterRef.current
      .off("clustermouseover")
      .on("clustermouseover", (e) => {
        const cluster = e.propagatedFrom;
        const markers = cluster.getAllChildMarkers() as MarkerWithBoard[];
        const statusCounts: Record<BoardStatus, number> = {
          not_yet: 0,
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
          not_yet: "未実施",
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

    markerClusterRef.current
      .off("clustermouseout")
      .on("clustermouseout", (e) => {
        const cluster = e.propagatedFrom;
        cluster.closeTooltip();
      });
  }, [boards, onBoardClick]);

  // 現在地を追跡
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.warn("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 1000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 現在地ボタンのハンドラ
  const handleLocate = () => {
    if (currentPos && mapRef.current) {
      mapRef.current.flyTo(currentPos, MAX_ZOOM, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  return (
    <div className="relative h-[600px] w-full z-0">
      <div id="poster-map-optimized" className="h-full w-full" />

      <PosterBoardFilter
        filterState={filterState}
        onToggleStatus={(status) => {
          const newStatuses = new Set(filterState.statuses);
          if (newStatuses.has(status)) {
            newStatuses.delete(status);
          } else {
            newStatuses.add(status);
          }
          handleFilterChange({ ...filterState, statuses: newStatuses });
        }}
        onToggleShowOnlyMine={() => {
          handleFilterChange({
            ...filterState,
            showOnlyMine: !filterState.showOnlyMine,
          });
        }}
        onSelectAll={() => {
          const allStatuses = Object.keys(statusConfig) as FilterStatus[];
          handleFilterChange({
            ...filterState,
            statuses: new Set(allStatuses),
          });
        }}
        onDeselectAll={() => {
          handleFilterChange({ ...filterState, statuses: new Set() });
        }}
        activeFilterCount={activeFilterCount}
      />

      {loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow-sm text-sm">
          読み込み中...
        </div>
      )}

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
