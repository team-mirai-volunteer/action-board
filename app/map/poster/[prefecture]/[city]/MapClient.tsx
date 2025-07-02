"use client";

import type { Database } from "@/lib/types/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef } from "react";
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

interface MapClientProps {
  boards: PosterBoard[];
  center: [number, number];
  zoom: number;
  userId?: string;
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

export function MapClient({ boards, center, zoom, userId }: MapClientProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleBoardClick = useCallback((board: PosterBoard) => {
    // For city-level view, just show info about the board
    toast.info(`${board.number ? `#${board.number} ` : ""}${board.name}`, {
      description: `${board.address}, ${board.city}`,
    });
  }, []);

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

  return (
    <div className="h-full w-full min-h-[600px]">
      <div ref={mapContainerRef} className="poster-map-container" />
    </div>
  );
}
