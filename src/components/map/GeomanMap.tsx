"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface GeomanMapProps {
  onMapReady?: (map: LeafletMap) => void;
  className?: string;
}

export default function GeomanMap({ onMapReady, className }: GeomanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    if (!mapRef.current) return;

    // Prevent double initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initializeMap = async () => {
      let L: typeof import("leaflet");

      try {
        // Try to import Leaflet
        L = (await import("leaflet")).default;
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
        if (isMountedRef.current) {
          setError("地図ライブラリの読み込みに失敗しました");
          toast.error(
            "地図の読み込みに失敗しました。ページを再読み込みしてください。",
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        // Import Geoman before creating the map
        await import("@geoman-io/leaflet-geoman-free");
      } catch (error) {
        console.error("Failed to load Leaflet-Geoman:", error);
        if (isMountedRef.current) {
          setError("地図編集ツールの読み込みに失敗しました");
          toast.error(
            "地図編集ツールの読み込みに失敗しました。ページを再読み込みしてください。",
          );
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

      // Create map
      if (!mapRef.current) return;

      try {
        const map = L.map(mapRef.current).setView([35.6762, 139.6503], 10);
        mapInstanceRef.current = map;

        console.log("Map created, pm available:", !!map.pm);

        if (onMapReady) {
          onMapReady(map);
        }

        // Fix map sizing issues by forcing a resize after initial render
        setTimeout(() => {
          if (isMountedRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

        if (isMountedRef.current) {
          setIsLoading(false);
          setError(null);
        }
      } catch (error) {
        console.error("Failed to initialize map:", error);
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
      // Set unmounted flag
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
        id="map"
        className={className}
        style={{
          width: "100%",
          height: "100vh",
          margin: 0,
          padding: 0,
        }}
      />
    </>
  );
}
