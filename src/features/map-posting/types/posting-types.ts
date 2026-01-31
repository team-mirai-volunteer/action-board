import type { Layer, Marker } from "leaflet";
import type { Json } from "@/lib/types/supabase";
import type { PostingShapeStatus } from "../config/status-config";

// === Cluster/Marker Types ===
// マーカーにシェイプデータを紐付けるための拡張型
export interface MarkerWithShape extends Marker {
  shapeData?: {
    id: string;
    status: PostingShapeStatus;
    posting_count?: number | null;
    lat: number;
    lng: number;
  };
}

// ステータス別カウント型
export type StatusCounts = Record<PostingShapeStatus, number>;

// === Database Types ===
export interface MapShape {
  id?: string;
  type: "polygon" | "text";
  coordinates: Json;
  properties?: Json;
  status?: PostingShapeStatus;
  memo?: string | null;
  user_id?: string;
  user_display_name?: string;
  event_id?: string;
  created_at?: string;
  updated_at?: string;
  // 住所情報（逆ジオコーディングで自動取得）
  prefecture?: string | null;
  city?: string | null;
  address?: string | null;
  postcode?: string | null;
  // ポリゴン中心座標
  lat?: number | null;
  lng?: number | null;
  // ポリゴンの面積（平方メートル）
  area_m2?: number | null;
  // 配布枚数（posting_activitiesから取得）
  posting_count?: number | null;
}

// ミッション達成チェック用（posting_activitiesから取得）
export interface ShapeMissionStatus {
  isCompleted: boolean;
  postingCount?: number;
  missionArtifactId?: string;
}

// === GeoJSON Types ===
export interface TextCoordinates {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface PolygonCoordinates {
  type: "Polygon";
  coordinates: number[][][];
}

export interface TextProperties {
  text?: string;
  [key: string]: unknown;
}

export interface PolygonProperties {
  originalType?: string;
  [key: string]: unknown;
}

export type MapCoordinates = TextCoordinates | PolygonCoordinates;
export type MapProperties = TextProperties | PolygonProperties;

// === Component Types ===
export interface PostingPageClientProps {
  userId: string;
  eventId: string;
  eventTitle: string;
  isAdmin: boolean;
  isEventActive: boolean;
}

// === Leaflet and Geoman Types ===
export type GeomanEvent = {
  layer?: Layer;
  target?: Layer;
};

export type LeafletWindow = Window & { L: typeof import("leaflet") };
