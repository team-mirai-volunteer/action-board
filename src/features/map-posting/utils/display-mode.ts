import type { Layer, Map as LeafletMap } from "leaflet";

interface DisplayModeRefs {
  // biome-ignore lint/suspicious/noExplicitAny: LayerGroup type from dynamic import
  polygonLayerGroupRef: { current: any };
  // biome-ignore lint/suspicious/noExplicitAny: MarkerClusterGroup type not available
  markerClusterRef: { current: any };
  postingLabelLayersRef: { current: Map<string, Layer> };
}

/**
 * クラスター/ポリゴン表示モードを切り替える
 * @param mapInstance - Leafletマップインスタンス
 * @param clusterMode - trueでクラスター表示、falseでポリゴン表示
 * @param refs - レイヤーグループへの参照
 */
export function toggleDisplayMode(
  mapInstance: LeafletMap | null,
  clusterMode: boolean,
  refs: DisplayModeRefs,
): void {
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
    for (const label of Array.from(postingLabelLayersRef.current.values())) {
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
    for (const label of Array.from(postingLabelLayersRef.current.values())) {
      if (!mapInstance.hasLayer(label)) {
        label.addTo(mapInstance);
      }
    }
  }
}
