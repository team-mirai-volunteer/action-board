// Types for map coordinates and properties
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
