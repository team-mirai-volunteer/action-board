"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCurrentLocation } from "@/features/map-posting/hooks/use-current-location";
import { CONTENT_HEIGHT } from "@/lib/constants/layout";
import type { PosterPlacementCityStats } from "../types/poster-placement-types";
import { createCityStatsMarkerIcon } from "../utils/city-stats-marker";

type PosterPlacementMapProps = {
  onMapReady?: (map: LeafletMap) => void;
  onPinPlaced?: (lat: number, lng: number) => void;
  pinPosition?: { lat: number; lng: number } | null;
  cityStats?: PosterPlacementCityStats[];
};

export default function PosterPlacementMap({
  onMapReady,
  onPinPlaced,
  pinPosition,
  cityStats,
}: PosterPlacementMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);
  const cityStatsMarkersRef = useRef<Marker[]>([]);
  const isMountedRef = useRef<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  useCurrentLocation(mapInstance, { flyToOnFirstLocation: true });

  useEffect(() => {
    isMountedRef.current = true;

    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initializeMap = async () => {
      let L: typeof import("leaflet");

      try {
        L = (await import("leaflet")).default;
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
        if (isMountedRef.current) {
          setError("地図ライブラリの読み込みに失敗しました");
          toast.error(
            "地図の読み込みに失敗しました。ページを再読み込みしてください。",
          );
          setIsLoading(false);
        }
        return;
      }

      // Set window.L for useCurrentLocation hook
      // biome-ignore lint/suspicious/noExplicitAny: Leaflet requires window.L for hooks
      (window as any).L = L;

      // Fix Leaflet default markers in Next.js
      // @ts-expect-error - Leaflet internals
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      // biome-ignore lint/suspicious/noExplicitAny: Leaflet adds _leaflet_id to container
      if ((mapRef.current as any)._leaflet_id) {
        return;
      }

      try {
        const map = L.map(mapRef.current, { maxZoom: 19 }).setView(
          [35.6762, 139.6503],
          13,
        );
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        map.on("click", (e) => {
          onPinPlaced?.(e.latlng.lat, e.latlng.lng);
        });

        if (onMapReady) {
          onMapReady(map);
        }

        setMapInstance(map);

        setTimeout(() => {
          if (isMountedRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

        if (isMountedRef.current) {
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to initialize map:", err);
        if (isMountedRef.current) {
          setError("地図の初期化に失敗しました");
          toast.error(
            "地図の初期化に失敗しました。ページを再読み込みしてください。",
          );
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMountedRef.current = false;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [onMapReady, onPinPlaced]);

  // Update pin marker when pinPosition changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // biome-ignore lint/suspicious/noExplicitAny: window.L for Leaflet
    const L = (window as any).L;
    if (!L) return;

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }

    if (pinPosition) {
      pinMarkerRef.current = L.marker([pinPosition.lat, pinPosition.lng]).addTo(
        mapInstanceRef.current,
      );
    }
  }, [pinPosition]);

  // 市区町村集計マーカーの描画・更新
  useEffect(() => {
    if (!mapInstance) return;

    // biome-ignore lint/suspicious/noExplicitAny: window.L for Leaflet
    const L = (window as any).L;
    if (!L) return;

    // 既存の集計マーカーを全て除去
    for (const marker of cityStatsMarkersRef.current) {
      marker.remove();
    }
    cityStatsMarkersRef.current = [];

    if (!cityStats) return;

    for (const stat of cityStats) {
      // avg_lat / avg_lng が null の場合はスキップ
      if (stat.avg_lat == null || stat.avg_lng == null) continue;

      const totalCount = Number(stat.total_count) || 0;
      if (totalCount === 0) continue;

      const marker = L.marker([Number(stat.avg_lat), Number(stat.avg_lng)], {
        icon: createCityStatsMarkerIcon(L, totalCount, stat.city ?? ""),
        // 集計マーカーは zIndexOffset を低くしてピンマーカーの下に表示
        zIndexOffset: -1000,
      }).addTo(mapInstance);

      // ツールチップで市区町村名と枚数を表示
      marker.bindTooltip(
        `${stat.prefecture ?? ""}${stat.city ?? ""}: ${totalCount}枚`,
        { direction: "top", offset: [0, -20] },
      );

      cityStatsMarkersRef.current.push(marker);
    }
  }, [cityStats, mapInstance]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-gray-900 border-b-2" />
            <p className="text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-4">
            <p className="mb-4 text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: CONTENT_HEIGHT,
          margin: 0,
          padding: 0,
          position: "relative",
          zIndex: 0,
        }}
      />
    </>
  );
}
