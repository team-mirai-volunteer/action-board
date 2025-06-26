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
type BoardStatus = Database["public"]["Enums"]["board_status"];

interface PosterMapPreviewProps {
  boards: PosterBoard[];
}

// Status colors for markers
const statusColors: Record<BoardStatus, string> = {
  not_yet: "#6B7280", // gray
  posted: "#10B981", // green
  checked: "#3B82F6", // blue
  damaged: "#EF4444", // red
  error: "#F59E0B", // yellow
  other: "#8B5CF6", // purple
};

// Create custom marker icon with status color
function createMarkerIcon(status: BoardStatus) {
  const color = statusColors[status];

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    className: "custom-marker",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function PosterMapPreview({ boards }: PosterMapPreviewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map centered on Japan
      mapRef.current = L.map("poster-map-preview", {
        zoomControl: false,
        dragging: true,
        doubleClickZoom: true,
        scrollWheelZoom: false,
        touchZoom: false,
        keyboard: false,
      }).setView([38.0, 138.0], 5);

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
          interactive: false, // Disable interaction
        }).addTo(mapRef.current);

        markersRef.current.push(marker);
      }
    }

    // Fit map to show all markers if there are any
    if (boards.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(boards.map((b) => [b.lat, b.lon]));
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
    }

    // Cleanup function
    return () => {
      for (const marker of markersRef.current) {
        marker.remove();
      }
    };
  }, [boards]);

  return <div id="poster-map-preview" className="h-full w-full relative z-0" />;
}
