"use client";

import type { CircleMarker, Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LeafletWindow } from "../types/posting-types";

interface UseCurrentLocationOptions {
  /** 初回の現在地取得時に自動で現在地に移動するか (default: false) */
  flyToOnFirstLocation?: boolean;
}

/**
 * 現在地の監視とマーカー表示を管理するhook
 */
export function useCurrentLocation(
  mapInstance: LeafletMap | null,
  options: UseCurrentLocationOptions = {},
) {
  const { flyToOnFirstLocation = false } = options;
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const currentMarkerRef = useRef<CircleMarker | null>(null);
  const hasFlownToLocationRef = useRef(false);

  // Watch current location
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // 位置情報の取得に失敗した場合は静かに処理
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 初回の現在地取得時に自動で飛ぶ
  useEffect(() => {
    if (
      flyToOnFirstLocation &&
      mapInstance &&
      currentPos &&
      !hasFlownToLocationRef.current
    ) {
      hasFlownToLocationRef.current = true;
      mapInstance.flyTo(currentPos, mapInstance.getZoom(), {
        animate: false,
      });
    }
  }, [flyToOnFirstLocation, mapInstance, currentPos]);

  // Manage current location marker
  useEffect(() => {
    if (!mapInstance) return;

    const L = (window as LeafletWindow).L;
    if (!L) return;

    // Remove existing current location marker
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }

    // Add marker if current position is available
    if (currentPos) {
      const marker = L.circleMarker(currentPos, {
        radius: 12,
        color: "#2563eb",
        fillColor: "#60a5fa",
        fillOpacity: 0.7,
        weight: 3,
      })
        .addTo(mapInstance)
        .bindTooltip("あなたの現在地", { permanent: false, direction: "top" });

      currentMarkerRef.current = marker;
    }
  }, [currentPos, mapInstance]);

  // Handle locate button click - fly to current location
  const handleLocate = useCallback(() => {
    if (currentPos && mapInstance) {
      mapInstance.flyTo(currentPos, mapInstance.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [currentPos, mapInstance]);

  return {
    currentPos,
    handleLocate,
  };
}
