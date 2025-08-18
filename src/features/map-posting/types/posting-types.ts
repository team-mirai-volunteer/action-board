import type { Json } from "@/lib/types/supabase";
import type { Layer } from "leaflet";

// Map shapes interface
export interface MapShape {
  id?: string;
  type: "polygon" | "text";
  coordinates: Json;
  properties?: Json;
  created_at?: string;
  updated_at?: string;
}

// Leaflet and Geoman type definitions
export type GeomanEvent = {
  layer?: Layer;
  target?: Layer;
};

export type LeafletWindow = Window & { L: typeof import("leaflet") };

// Component props
export interface PostingPageClientProps {
  userId: string;
}
