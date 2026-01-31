import { area } from "@turf/area";
import { polygon } from "@turf/helpers";
import type { Json } from "@/lib/types/supabase";

interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

interface PointCoordinate {
  lat: number;
  lng: number;
}

/**
 * ポリゴンの重心（centroid）を計算
 *
 * GeoJSON Polygon の coordinates は [[[lng, lat], [lng, lat], ...]] 形式
 * 外側のリングのみを使用（穴は無視）
 */
export function calculatePolygonCentroid(
  coordinates: Json,
): PointCoordinate | null {
  try {
    const geojson = coordinates as unknown as GeoJSONPolygon;

    if (
      geojson.type !== "Polygon" ||
      !geojson.coordinates ||
      !geojson.coordinates[0]
    ) {
      return null;
    }

    const ring = geojson.coordinates[0]; // 外側のリング

    if (ring.length === 0) {
      return null;
    }

    // 単純な重心計算（全頂点の平均）
    let sumLat = 0;
    let sumLng = 0;

    // 最後の点は最初の点と同じなので除外
    const points =
      ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1]
        ? ring.slice(0, -1)
        : ring;

    for (const point of points) {
      sumLng += point[0];
      sumLat += point[1];
    }

    return {
      lat: sumLat / points.length,
      lng: sumLng / points.length,
    };
  } catch (error) {
    console.error("Failed to calculate polygon centroid:", error);
    return null;
  }
}

/**
 * ポリゴンの面積を計算（平方メートル）
 *
 * GeoJSON Polygon の coordinates は [[[lng, lat], [lng, lat], ...]] 形式
 * Turf.jsを使用して球面幾何学による正確な面積を計算
 */
export function calculatePolygonArea(coordinates: Json): number | null {
  try {
    const geojson = coordinates as unknown as GeoJSONPolygon;

    if (
      geojson.type !== "Polygon" ||
      !geojson.coordinates ||
      !geojson.coordinates[0]
    ) {
      return null;
    }

    const poly = polygon(geojson.coordinates);
    return area(poly); // m²
  } catch (error) {
    console.error("Failed to calculate polygon area:", error);
    return null;
  }
}
