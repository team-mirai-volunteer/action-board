"use client";

import type { Map as LMap } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { CONTENT_HEIGHT } from "@/lib/constants/layout";

interface PosterLeafletMapProps {
  onMapReady?: (map: LMap) => void;
  className?: string;
}

/**
 * 基本的なLeafletマップコンポーネント（Geomanなし）
 * ピン配置と閲覧に使用
 */
export default function PosterLeafletMap({
  onMapReady,
  className,
}: PosterLeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LMap | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch {
        if (isMountedRef.current) {
          setError("地図ライブラリの読み込みに失敗しました");
          setIsLoading(false);
        }
        return;
      }

      // Fix Leaflet default markers in Next.js
      // @ts-expect-error - Leaflet internals
      L.Icon.Default.prototype._getIconUrl = undefined;
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
        const map = L.map(mapRef.current, { maxZoom: 18 }).setView(
          [35.6762, 139.6503],
          6,
        );
        mapInstanceRef.current = map;

        // GSI tiles (国土地理院タイル)
        L.tileLayer(
          "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
            maxZoom: 18,
          },
        ).addTo(map);

        if (onMapReady) {
          onMapReady(map);
        }

        setTimeout(() => {
          if (isMountedRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

        if (isMountedRef.current) {
          setIsLoading(false);
          setError(null);
        }
      } catch {
        if (isMountedRef.current) {
          setError("地図の初期化に失敗しました");
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
  }, [onMapReady]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center p-4">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={className}
        style={{
          width: "100%",
          height: CONTENT_HEIGHT,
          margin: 0,
          padding: 0,
        }}
      />
    </>
  );
}
