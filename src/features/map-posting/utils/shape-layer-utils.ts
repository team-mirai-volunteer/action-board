import type { Layer } from "leaflet";
import {
  type PostingShapeStatus,
  postingStatusConfig,
} from "../config/status-config";

/**
 * レイヤーからシェイプIDを取得
 * 複数の保存場所をチェックして返す
 */
export function getShapeId(layer: Layer): string | undefined {
  return (
    layer._shapeId ||
    ((layer?.options as Record<string, unknown>)?.shapeId as
      | string
      | undefined) ||
    (layer?.feature?.properties?._shapeId as string | undefined)
  );
}

/**
 * シェイプIDをレイヤーの複数箇所に保存
 * - layer._shapeId
 * - layer.options.shapeId
 * - layer.feature.properties._shapeId
 * - 子レイヤーにも再帰的に適用
 */
export function propagateShapeId(layer: Layer, id: string): void {
  if (!layer) return;
  layer._shapeId = id;
  if (layer.options) (layer.options as Record<string, unknown>).shapeId = id;
  if (layer.feature?.properties) {
    layer.feature.properties._shapeId = id;
  }
  if (layer.getLayers) {
    const layers = layer.getLayers?.();
    if (layers) {
      for (const sub of layers) {
        propagateShapeId(sub, id);
      }
    }
  }
}

/**
 * ステータスに応じたスタイルをレイヤーに適用
 * Path層とGeoJSON LayerGroupの両方に対応
 */
export function applyStatusStyle(
  layer: Layer,
  status: PostingShapeStatus = "planned",
): void {
  const config = postingStatusConfig[status];
  const style = {
    color: config.color,
    fillColor: config.fillColor,
    fillOpacity: config.fillOpacity,
  };

  // Check if layer has setStyle method (Path layers)
  if ("setStyle" in layer && typeof layer.setStyle === "function") {
    (layer as Layer & { setStyle: (style: object) => void }).setStyle(style);
  } else if ("eachLayer" in layer && typeof layer.eachLayer === "function") {
    // For GeoJSON layers which are LayerGroups
    (
      layer as Layer & { eachLayer: (fn: (l: Layer) => void) => void }
    ).eachLayer((subLayer) => {
      if ("setStyle" in subLayer && typeof subLayer.setStyle === "function") {
        (subLayer as Layer & { setStyle: (style: object) => void }).setStyle(
          style,
        );
      }
    });
  }
}
