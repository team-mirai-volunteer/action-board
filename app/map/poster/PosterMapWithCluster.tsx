"use client";

import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./poster-map.css";
import { MAX_ZOOM } from "@/lib/constants";
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

interface PosterMapWithClusterProps {
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
  boardData?: PosterBoard;
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
}: PosterMapWithClusterProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const currentMarkerRef = useRef<L.CircleMarker | null>(null);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);

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
        maxZoom: MAX_ZOOM,
      }).addTo(mapRef.current);

      // Initialize marker cluster group
      markerClusterRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: createClusterIcon,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16, // Disable clustering at high zoom levels
      });

      // Add cluster events for tooltips
      markerClusterRef.current.on("clustermouseover", (e) => {
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
    if (!markerClusterRef.current) return;

    // Clear existing markers
    markerClusterRef.current.clearLayers();

    // Add markers for each board
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

        // Store board data in marker for cluster icon calculation
        (marker as MarkerWithBoard).boardData = board;

        markerClusterRef.current.addLayer(marker);
      }
    }
  }, [boards, onBoardClick]);

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

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerClusterRef.current = null;
      }
    };
  }, []);

  // 現在地取得ボタンのハンドラ
  const handleLocate = () => {
    if (currentPos && mapRef.current) {
      mapRef.current.setView(currentPos, MAX_ZOOM, { animate: true });
    }
  };

  return (
    <div className="relative h-[600px] w-full z-0">
      <div id="poster-map-cluster" className="h-full w-full" />
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
