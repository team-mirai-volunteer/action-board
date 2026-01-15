import type { Json } from "@/lib/types/supabase";
import type { Layer } from "leaflet";
import type { PostingShapeStatus } from "../config/status-config";

// === Database Types ===
export interface MapShape {
  id?: string;
  type: "polygon" | "text";
  coordinates: Json;
  properties?: Json;
  status?: PostingShapeStatus;
  user_id?: string;
  user_display_name?: string;
  event_id?: string;
  created_at?: string;
  updated_at?: string;
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
}

// === Leaflet and Geoman Types ===
export type GeomanEvent = {
  layer?: Layer;
  target?: Layer;
};

export type LeafletWindow = Window & { L: typeof import("leaflet") };
