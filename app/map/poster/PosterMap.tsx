"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./poster-map.css";
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

interface PosterMapProps {
  boards: PosterBoard[];
  onBoardClick: (board: PosterBoard) => void;
  center: [number, number];
}

// Status colors for markers
const statusColors: Record<BoardStatus, string> = {
  not_yet: "#6B7280", // gray
  reserved: "#F59E0B", // yellow/orange
  posted: "#10B981", // green
  checked: "#3B82F6", // blue
  damaged: "#EF4444", // red
  error: "#DC2626", // darker red
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
}: PosterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map with center from props
      mapRef.current = L.map("poster-map").setView(center, 12);

      // Add tile layer (using GSI tiles)
      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    for (const marker of markersRef.current) {
      marker.remove();
    }
    markersRef.current = [];

    // Add markers for each board
    for (const board of boards) {
      if (mapRef.current) {
        const marker = L.marker([board.lat, board.lon], {
          icon: createMarkerIcon(board.status),
        })
          .addTo(mapRef.current)
          .bindTooltip(
            `${board.number ? `#${board.number} ` : ""}${board.name}`,
            { permanent: false, direction: "top" },
          )
          .on("click", () => onBoardClick(board));

        markersRef.current.push(marker);
      }
    }

    // Update map view when center changes
    if (mapRef.current) {
      mapRef.current.setView(center, 12);
    }

    // Cleanup function
    return () => {
      for (const marker of markersRef.current) {
        marker.remove();
      }
    };
  }, [boards, onBoardClick, center]);

  return <div id="poster-map" className="h-[600px] w-full relative z-0" />;
}
