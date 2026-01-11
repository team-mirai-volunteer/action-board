import type { Json } from "@/lib/types/supabase";
import type { Layer } from "leaflet";

// === Status Types ===
export type PostingShapeStatus =
  | "planned"
  | "completed"
  | "unavailable"
  | "other";

// === Database Types ===
export interface MapShape {
  id?: string;
  type: "polygon" | "text";
  coordinates: Json;
  properties?: Json;
  event_id: string;
  status?: PostingShapeStatus;
  posting_count?: number | null;
  created_at?: string;
  updated_at?: string;
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
