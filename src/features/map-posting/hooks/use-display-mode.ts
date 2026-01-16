"use client";

import type { Layer, Map as LeafletMap } from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { CLUSTER_THRESHOLD_ZOOM } from "../config/status-config";

interface DisplayModeRefs {
  // biome-ignore lint/suspicious/noExplicitAny: LayerGroup type from dynamic import
  polygonLayerGroupRef: React.MutableRefObject<any>;
  // biome-ignore lint/suspicious/noExplicitAny: MarkerClusterGroup type not available
  markerClusterRef: React.MutableRefObject<any>;
  postingLabelLayersRef: React.MutableRefObject<Map<string, Layer>>;
}

/**
 * クラスター/ポリゴン表示モードを管理するhook
 * ズームレベルに応じて自動的に切り替える
 */
export function useDisplayMode(
  mapInstance: LeafletMap | null,
  refs: DisplayModeRefs,
) {
  const [isClusterMode, setIsClusterMode] = useState(true);
  const isClusterModeRef = useRef(isClusterMode);

  // Keep ref in sync with state
  useEffect(() => {
    isClusterModeRef.current = isClusterMode;
  }, [isClusterMode]);

  // Toggle display mode between cluster and polygon
  const toggleDisplayMode = useCallback(
    (clusterMode: boolean) => {
      const { polygonLayerGroupRef, markerClusterRef, postingLabelLayersRef } =
        refs;

      if (
        !mapInstance ||
        !polygonLayerGroupRef.current ||
        !markerClusterRef.current
      )
        return;

      if (clusterMode) {
        // Show cluster markers, hide polygons
        if (mapInstance.hasLayer(polygonLayerGroupRef.current)) {
          mapInstance.removeLayer(polygonLayerGroupRef.current);
        }
        // Hide posting count labels
        for (const label of Array.from(
          postingLabelLayersRef.current.values(),
        )) {
          if (mapInstance.hasLayer(label)) {
            mapInstance.removeLayer(label);
          }
        }
        if (!mapInstance.hasLayer(markerClusterRef.current)) {
          mapInstance.addLayer(markerClusterRef.current);
        }
      } else {
        // Show polygons, hide cluster markers
        if (mapInstance.hasLayer(markerClusterRef.current)) {
          mapInstance.removeLayer(markerClusterRef.current);
        }
        if (!mapInstance.hasLayer(polygonLayerGroupRef.current)) {
          mapInstance.addLayer(polygonLayerGroupRef.current);
        }
        // Show posting count labels for completed shapes
        for (const label of Array.from(
          postingLabelLayersRef.current.values(),
        )) {
          if (!mapInstance.hasLayer(label)) {
            label.addTo(mapInstance);
          }
        }
      }
    },
    [mapInstance, refs],
  );

  // Set up zoom event listener for display mode toggle
  const setupZoomListener = useCallback(() => {
    if (!mapInstance) return;

    const handleZoomEnd = () => {
      const zoom = mapInstance.getZoom();
      const shouldBeClusterMode = zoom < CLUSTER_THRESHOLD_ZOOM;

      if (shouldBeClusterMode !== isClusterModeRef.current) {
        setIsClusterMode(shouldBeClusterMode);
        toggleDisplayMode(shouldBeClusterMode);
      }
    };

    mapInstance.on("zoomend", handleZoomEnd);

    // Check initial zoom level
    const initialZoom = mapInstance.getZoom();
    const initialClusterMode = initialZoom < CLUSTER_THRESHOLD_ZOOM;
    setIsClusterMode(initialClusterMode);

    return () => {
      mapInstance.off("zoomend", handleZoomEnd);
    };
  }, [mapInstance, toggleDisplayMode]);

  return {
    isClusterMode,
    isClusterModeRef,
    setIsClusterMode,
    toggleDisplayMode,
    setupZoomListener,
  };
}
