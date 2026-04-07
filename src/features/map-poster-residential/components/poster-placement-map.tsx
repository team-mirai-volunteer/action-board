"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CONTENT_HEIGHT } from "@/lib/constants/layout";
import { useCurrentLocation } from "@/lib/hooks/use-current-location";
import type {
  PosterPlacement,
  PosterPlacementCityStats,
} from "../types/poster-placement-types";
import { createCityStatsMarkerIcon } from "../utils/city-stats-marker";

type PosterPlacementMapProps = {
  onMapReady?: (map: LeafletMap) => void;
  onPinPlaced?: (lat: number, lng: number) => void;
  onPlacementClick?: (placement: PosterPlacement) => void;
  pinPosition?: { lat: number; lng: number } | null;
  cityStats?: PosterPlacementCityStats[];
  myPlacements?: PosterPlacement[];
  showMyPins?: boolean;
};

export default function PosterPlacementMap({
  onMapReady,
  onPinPlaced,
  onPlacementClick,
  pinPosition,
  cityStats,
  myPlacements,
  showMyPins = false,
}: PosterPlacementMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: MarkerClusterGroup type conflicts with Leaflet Layer type
  const clusterGroupRef = useRef<any>(null);
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
        await import("leaflet.markercluster");
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

        // 単一クラスタグループ（city stats / my pins 共用）
        clusterGroupRef.current = L.markerClusterGroup({
          maxClusterRadius: 60,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          chunkedLoading: true,
          removeOutsideVisibleBounds: true,
          spiderfyOnMaxZoom: true,
          iconCreateFunction: (cluster: any) => {
            const childMarkers = cluster.getAllChildMarkers();
            let total = 0;
            for (const m of childMarkers) {
              total += m.options.totalCount ?? 1;
            }
            return createCityStatsMarkerIcon(L, total, "");
          },
        });
        map.addLayer(clusterGroupRef.current);

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
    if (!mapInstance) return;

    // biome-ignore lint/suspicious/noExplicitAny: window.L for Leaflet
    const L = (window as any).L;
    if (!L) return;

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }

    if (pinPosition) {
      pinMarkerRef.current = L.marker([pinPosition.lat, pinPosition.lng]).addTo(
        mapInstance,
      );
    }
  }, [pinPosition, mapInstance]);

  // クラスタの中身を切り替え: showMyPins ON → 自分のピン / OFF → city stats
  useEffect(() => {
    if (!mapInstance || !clusterGroupRef.current) return;

    // biome-ignore lint/suspicious/noExplicitAny: window.L for Leaflet
    const L = (window as any).L;
    if (!L) return;

    clusterGroupRef.current.clearLayers();

    if (showMyPins) {
      // 自分のピンを表示
      if (!myPlacements) return;
      for (const placement of myPlacements) {
        const marker = L.marker(
          [Number(placement.lat), Number(placement.lng)],
          { totalCount: placement.count },
        );

        const tooltipEl = document.createElement("span");
        tooltipEl.textContent = `${placement.address ?? "住所不明"} (${placement.count}枚)`;
        marker.bindTooltip(tooltipEl, { direction: "top" });

        marker.on("click", (e: L.LeafletMouseEvent) => {
          e.originalEvent.stopPropagation();
          onPlacementClick?.(placement);
        });

        clusterGroupRef.current.addLayer(marker);
      }
    } else {
      // 市区町村集計マーカーを表示
      if (!cityStats) return;
      for (const stat of cityStats) {
        if (stat.avg_lat == null || stat.avg_lng == null) continue;

        const totalCount = Number(stat.total_count) || 0;
        if (totalCount === 0) continue;

        const marker = L.marker([Number(stat.avg_lat), Number(stat.avg_lng)], {
          icon: createCityStatsMarkerIcon(L, totalCount, stat.city ?? ""),
          totalCount,
        });

        const tooltipEl = document.createElement("span");
        tooltipEl.textContent = `${stat.prefecture ?? ""}${stat.city ?? ""}: ${totalCount}枚`;
        marker.bindTooltip(tooltipEl, {
          direction: "top",
          offset: [0, -20],
        });

        clusterGroupRef.current.addLayer(marker);
      }
    }
  }, [showMyPins, cityStats, myPlacements, mapInstance, onPlacementClick]);

  return (
    <div className="relative" style={{ width: "100%", height: CONTENT_HEIGHT }}>
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
          height: "100%",
          margin: 0,
          padding: 0,
          position: "relative",
          zIndex: 0,
        }}
      />
    </div>
  );
}
