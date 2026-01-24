import type { Layer, Map as LeafletMap } from "leaflet";
import { getClusterThresholdForArea } from "../config/status-config";

interface DisplayModeRefs {
  // biome-ignore lint/suspicious/noExplicitAny: LayerGroup type from dynamic import
  polygonLayerGroupRef: { current: any };
  // biome-ignore lint/suspicious/noExplicitAny: MarkerClusterGroup type not available
  markerClusterRef: { current: any };
  postingLabelLayersRef: { current: Map<string, Layer> };
}

interface ShapeAreaInfo {
  id: string;
  area_m2: number | null;
  user_id: string | null;
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

interface AreaBasedDisplayModeRefs extends DisplayModeRefs {
  polygonLayersRef: { current: Map<string, Layer> };
  // biome-ignore lint/suspicious/noExplicitAny: Marker type with custom properties
  clusterMarkersRef: { current: Map<string, any> };
}

interface DisplayFilterOptions {
  showOnlyMine: boolean;
  currentUserId: string | null;
}

/**
 * 面積ベースで各shapeの表示モードを切り替える
 * 大きいshapeは低ズームでもポリゴン表示、小さいshapeは高ズームからポリゴン表示
 *
 * @param mapInstance - Leafletマップインスタンス
 * @param currentZoom - 現在のズームレベル
 * @param shapesAreaInfo - 各shapeの面積情報
 * @param refs - レイヤーへの参照
 * @param filterOptions - フィルターオプション（自分のみ表示など）
 */
export function updateDisplayModeByArea(
  mapInstance: LeafletMap | null,
  currentZoom: number,
  shapesAreaInfo: ShapeAreaInfo[],
  refs: AreaBasedDisplayModeRefs,
  filterOptions?: DisplayFilterOptions,
): void {
  const {
    polygonLayerGroupRef,
    markerClusterRef,
    postingLabelLayersRef,
    polygonLayersRef,
    clusterMarkersRef,
  } = refs;

  if (
    !mapInstance ||
    !polygonLayerGroupRef.current ||
    !markerClusterRef.current
  )
    return;

  // 表示するポリゴンを収集（後でz-order調整用）
  const visiblePolygons: Array<{ layer: Layer; area_m2: number | null }> = [];

  // 各shapeについて、面積に応じた閾値と現在のズームを比較
  for (const { id, area_m2, user_id } of shapesAreaInfo) {
    // フィルター適用: showOnlyMineがtrueの場合、自分のshapeのみ表示
    const passesFilter =
      !filterOptions?.showOnlyMine || user_id === filterOptions.currentUserId;

    const threshold = getClusterThresholdForArea(area_m2);
    const shouldShowPolygon = currentZoom >= threshold && passesFilter;

    const polygonLayer = polygonLayersRef.current.get(id);
    const marker = clusterMarkersRef.current.get(id);
    const label = postingLabelLayersRef.current.get(id);

    if (!passesFilter) {
      // フィルターを通過しない場合、ポリゴン・マーカー・ラベルすべて非表示
      if (polygonLayer && polygonLayerGroupRef.current.hasLayer(polygonLayer)) {
        polygonLayerGroupRef.current.removeLayer(polygonLayer);
      }
      if (marker && markerClusterRef.current.hasLayer(marker)) {
        markerClusterRef.current.removeLayer(marker);
      }
      if (label && mapInstance.hasLayer(label)) {
        mapInstance.removeLayer(label);
      }
    } else if (shouldShowPolygon) {
      // ポリゴン表示、マーカー非表示
      if (
        polygonLayer &&
        !polygonLayerGroupRef.current.hasLayer(polygonLayer)
      ) {
        polygonLayerGroupRef.current.addLayer(polygonLayer);
      }
      if (polygonLayer) {
        visiblePolygons.push({ layer: polygonLayer, area_m2 });
      }
      if (marker && markerClusterRef.current.hasLayer(marker)) {
        markerClusterRef.current.removeLayer(marker);
      }
      // ラベル表示
      if (label && !mapInstance.hasLayer(label)) {
        label.addTo(mapInstance);
      }
    } else {
      // マーカー表示、ポリゴン非表示
      if (polygonLayer && polygonLayerGroupRef.current.hasLayer(polygonLayer)) {
        polygonLayerGroupRef.current.removeLayer(polygonLayer);
      }
      if (marker && !markerClusterRef.current.hasLayer(marker)) {
        markerClusterRef.current.addLayer(marker);
      }
      // ラベル非表示
      if (label && mapInstance.hasLayer(label)) {
        mapInstance.removeLayer(label);
      }
    }
  }

  // 面積が小さいポリゴンを前面に表示（クリック優先）
  // 面積の大きい順にソートして、大きい方から順にbringToFrontを呼ぶと、最終的に小さい方が前面になる
  const sortedPolygons = visiblePolygons.sort(
    (a, b) =>
      (b.area_m2 ?? Number.POSITIVE_INFINITY) -
      (a.area_m2 ?? Number.POSITIVE_INFINITY),
  );
  for (const { layer } of sortedPolygons) {
    if ("bringToFront" in layer && typeof layer.bringToFront === "function") {
      layer.bringToFront();
    }
  }

  // ポリゴンレイヤーグループとマーカークラスターの可視性を確保
  if (!mapInstance.hasLayer(polygonLayerGroupRef.current)) {
    mapInstance.addLayer(polygonLayerGroupRef.current);
  }
  if (!mapInstance.hasLayer(markerClusterRef.current)) {
    mapInstance.addLayer(markerClusterRef.current);
  }
}
