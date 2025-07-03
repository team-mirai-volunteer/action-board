"use client";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./poster-map.css";
import {
  type PosterPrefectureKey,
  getPrefectureDefaultZoom,
} from "@/lib/constants/poster-prefectures";
import type { Database } from "@/lib/types/supabase";

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

type PosterBoardWithOffset = PosterBoard & {
  offsetLat: number;
  offsetLong: number;
};

interface PosterMapProps {
  boards: PosterBoard[];
  onBoardClick: (board: PosterBoard) => void;
  center: [number, number];
  prefectureKey?: PosterPrefectureKey;
}

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

function offsetDuplicateCoordinates(
  boards: PosterBoard[],
): PosterBoardWithOffset[] {
  const coordinateMap = new Map<string, number>();

  return boards.map((board) => {
    const coordKey = `${board.lat.toFixed(6)},${board.long.toFixed(6)}`;
    const duplicateCount = coordinateMap.get(coordKey) || 0;
    coordinateMap.set(coordKey, duplicateCount + 1);

    const offsetDistance = 0.00005;
    const angle = duplicateCount * 60 * (Math.PI / 180); // 60 degrees apart

    return {
      ...board,
      offsetLat:
        board.lat + (duplicateCount > 0 ? Math.cos(angle) * offsetDistance : 0),
      offsetLong:
        board.long +
        (duplicateCount > 0 ? Math.sin(angle) * offsetDistance : 0),
    };
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

    const boardsWithOffset = offsetDuplicateCoordinates(boards);

    // Add markers for each board
    for (const board of boardsWithOffset) {
      if (mapRef.current) {
        const marker = L.marker([board.offsetLat, board.offsetLong], {
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
  }, [boards]);

  // 画面を開いた瞬間から現在地をwatchし、移動に追従
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (error) => {
        console.warn("位置情報の取得に失敗しました:", error.message);
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

  return (
    <div className="relative h-[600px] w-full z-0">
      <div id="poster-map" className="h-full w-full" />
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
