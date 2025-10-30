import type { Json } from "@/lib/types/supabase";
import type { Layer } from "leaflet";

// === Database Types ===
export interface MapShape {
  id?: string;
  type: "polygon" | "text";
  coordinates: Json;
  properties?: Json;
  created_at?: string;
  updated_at?: string;
}

// === GeoJSON Types ===
export interface TextCoordinates {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface PolygonProperties {
  originalType?: string;
  [key: string]: unknown;
}

// === Component Types ===
export interface PostingPageClientProps {
  userId: string;
}

// === Leaflet and Geoman Types ===
export type GeomanEvent = {
  layer?: Layer;
  target?: Layer;
};

export type LeafletWindow = Window & { L: typeof import("leaflet") };
