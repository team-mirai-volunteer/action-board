import type * as L from "leaflet";

declare module "leaflet" {
  // Custom properties added to layers
  interface Layer {
    _shapeId?: string;
    _textDirty?: boolean;
    _url?: string;
    toGeoJSON(): GeoJSON.Feature | GeoJSON.FeatureCollection;
    getLatLng(): L.LatLng;
    getLayers?(): Layer[];
    feature?: {
      properties?: {
        _shapeId?: string;
        [key: string]: unknown;
      };
    };
    options?: {
      shapeId?: string;
      textMarker?: boolean;
      text?: string;
      [key: string]: unknown;
    };
  }

  interface Map {
    pm: {
      // Toolbar controls
      addControls(options?: {
        position?: "topleft" | "topright" | "bottomleft" | "bottomright";
        drawPolygon?: boolean;
        drawText?: boolean;
        drawMarker?: boolean;
        drawCircleMarker?: boolean;
        drawPolyline?: boolean;
        drawRectangle?: boolean;
        drawCircle?: boolean;
        editMode?: boolean;
        dragMode?: boolean;
        cutPolygon?: boolean;
        removalMode?: boolean;
        rotateMode?: boolean;
        oneBlock?: boolean;
        drawControls?: boolean;
        editControls?: boolean;
        optionsControls?: boolean;
        customControls?: boolean;
      }): void;
      removeControls(): void;

      // Drawing
      enableDraw(
        shape: "Polygon" | "Text",
        options?: {
          snappable?: boolean;
          allowSelfIntersection?: boolean;
          finishOn?: string | null;
        },
      ): void;
      disableDraw(): void;

      // Global edit mode
      enableGlobalEditMode(): void;
      disableGlobalEditMode(): void;

      // Global removal mode
      enableGlobalRemovalMode(): void;
      disableGlobalRemovalMode(): void;

      // Path options
      setPathOptions(options: {
        snappable?: boolean;
        snapDistance?: number;
      }): void;
    };
  }

  interface Layer {
    pm?: {
      // Enable/disable editing
      enable(): void;
      disable(): void;

      // Remove layer
      remove(): void;

      // Get shape type
      getShape?(): string;

      // Text specific methods
      getText?(): string;
      setText?(text: string): void;
    };
  }

  interface Polygon {
    pm: {
      enable(): void;
      disable(): void;
      remove(): void;
    };
  }

  // Map events
  interface MapEvents {
    "pm:create": (e: {
      layer: Layer;
      layerType?: string;
      shape?: string;
    }) => void;
    "pm:remove": (e: { layer: Layer }) => void;
    "pm:update": (e: { layer: Layer }) => void;
    "pm:cut": (e: { layer?: Layer; layers?: Layer[] }) => void;
    "pm:undo": (e: { layer?: Layer; layers?: Layer[] }) => void;
    "pm:redo": (e: { layer?: Layer; layers?: Layer[] }) => void;
  }

  // Layer events
  interface LayerEvents {
    "pm:change": (e: { layer?: Layer; target?: Layer }) => void;
    "pm:dragend": (e: { layer?: Layer; target?: Layer }) => void;
    "pm:textchange": (e: { layer?: Layer; target?: Layer }) => void;
    "pm:textblur": (e: { layer?: Layer; target?: Layer }) => void;
  }
}
