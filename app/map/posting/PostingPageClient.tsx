"use client";

import {
  type MapShape as MapShapeData,
  deleteShape as deleteMapShape,
  loadShapes as loadMapShapes,
  saveShape as saveMapShape,
  updateShape as updateMapShape,
} from "@/lib/services/posting";
import type { PolygonProperties, TextCoordinates } from "@/lib/types/map-types";
import type { Json } from "@/lib/types/supabase";
import type { Layer, Map as LeafletMap, Marker, Path } from "leaflet";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const GeomanMap = dynamic(() => import("@/components/map/GeomanMap"), {
  ssr: false,
});

interface PostingPageClientProps {
  userId: string;
}

// Type definitions for Leaflet and Geoman
type GeomanEvent = {
  layer?: Layer;
  target?: Layer;
};
type LeafletWindow = Window & { L: typeof import("leaflet") };

export default function PostingPageClient(_props: PostingPageClientProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [shapeCount, setShapeCount] = useState(0);
  const autoSave = true;

  useEffect(() => {
    if (!mapInstance) return;

    const initializePostingMap = async () => {
      const L = (await import("leaflet")).default;

      console.log("Map instance received, pm available:", !!mapInstance.pm);

      L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
      }).addTo(mapInstance);

      mapInstance.pm.addControls({
        position: "topleft",
        // Only enable polygon and text drawing
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawPolygon: true, // Enable polygon drawing
        drawCircle: false,
        drawText: true, // Enable text drawing
        // modes
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
        rotateMode: false,
        oneBlock: false,
        // controls
        drawControls: true,
        editControls: true,
        optionsControls: false,
        customControls: false,
      });

      console.log("Geoman controls added successfully");

      mapInstance.on("pm:create", async (e: GeomanEvent) => {
        console.log("Shape created:", e.layer);
        if (e.layer) {
          await saveOrUpdateLayer(e.layer);
          attachTextEvents(e.layer);
          updateShapeCount();
        }
      });

      mapInstance.on("pm:remove", async (e: GeomanEvent) => {
        console.log("Shape removed:", e.layer);
        const layer = e.layer;
        if (layer) {
          const sid = getShapeId(layer);
          if (sid) {
            await deleteMapShape(sid);
          }
          updateShapeCount();
        }
      });

      mapInstance.on("pm:update", async (e: GeomanEvent) => {
        console.log("Shape updated:", e.layer);
        if (e.layer) {
          await saveOrUpdateLayer(e.layer);
        }
      });

      mapInstance.on("pm:cut", (e: GeomanEvent) => {
        console.log("Shape cut:", e);
      });

      mapInstance.on("pm:undo", (e: GeomanEvent) => {
        console.log("Undo action:", e);
      });

      mapInstance.on("pm:redo", (e: GeomanEvent) => {
        console.log("Redo action:", e);
      });

      mapInstance.pm.setPathOptions({
        snappable: true,
        snapDistance: 20,
      });

      loadExistingShapes();
    };

    const loadExistingShapes = async () => {
      try {
        const savedShapes = await loadMapShapes();
        const L = (await import("leaflet")).default;

        for (const shape of savedShapes) {
          try {
            let layer: Layer | undefined;

            if (shape.type === "text") {
              const coords = shape.coordinates as unknown as TextCoordinates;
              const [lng, lat] = coords.coordinates;
              const text = (shape.properties as { text?: string })?.text || "";
              layer = L.marker([lat, lng], {
                textMarker: true,
                text,
              } as L.MarkerOptions) as unknown as Layer;
              layer._shapeId = shape.id; // preserve id
              attachTextEvents(layer);
            } else if (shape.type === "polygon") {
              layer = L.geoJSON(
                shape.coordinates as unknown as GeoJSON.Polygon,
              ) as unknown as Layer;
              layer._shapeId = shape.id; // preserve id
            }

            if (layer) {
              layer.addTo(mapInstance);

              propagateShapeId(layer, shape.id);

              if (
                shape.type === "text" ||
                (shape.properties as PolygonProperties)?.originalType === "Text"
              ) {
                attachTextEvents(layer);
              }

              console.log("Loaded shape:", shape.type);
            }
          } catch (layerError) {
            console.error(
              "Failed to create layer for shape:",
              shape,
              layerError,
            );
          }
        }

        console.log("Loaded existing shapes:", savedShapes.length);
        updateShapeCount();
      } catch (error) {
        console.error("Failed to load existing shapes:", error);
      }
    };

    initializePostingMap();
  }, [mapInstance]);

  const getAllDrawnLayers = () => {
    if (!mapInstance) return [];

    const L = (window as LeafletWindow).L;
    const allLayers: Layer[] = [];

    mapInstance.eachLayer((layer: Layer) => {
      if (layer instanceof L.Path || layer instanceof L.Marker) {
        if (layer.pm && !layer._url) {
          allLayers.push(layer);
        }
      }
    });

    return allLayers;
  };

  const updateShapeCount = () => {
    const drawnLayers = getAllDrawnLayers();
    setShapeCount(drawnLayers.length);
    console.log("Shape count updated:", drawnLayers.length);
  };

  const textMarkerStyles = `
    .pm-text {
      font-size:14px;
      color:#000;
    }
  `;

  function attachTextEvents(layer: Layer) {
    if (!layer || !layer.pm) return;

    layer.off("pm:textchange");
    layer.off("pm:textblur");

    layer.on("pm:textchange", () => {
      layer._textDirty = true;
    });

    layer.on("pm:textblur", () => {
      if (layer._textDirty) {
        console.log("Text layer changed -> saving");
        layer._textDirty = false;
        if (autoSave) saveOrUpdateLayer(layer);
      }
    });
  }

  const extractShapeData = (layer: Layer): MapShapeData => {
    const shapeName = layer.pm?.getShape ? layer.pm.getShape() : undefined;

    if (shapeName === "Text") {
      const center = layer.getLatLng();
      const textContent = layer.pm?.getText ? layer.pm.getText() : "";
      return {
        type: "text",
        coordinates: {
          type: "Point",
          coordinates: [center.lng, center.lat],
        },
        properties: { text: textContent },
      };
    }

    // Default to polygon for all other shapes
    const geoJSON = layer.toGeoJSON() as GeoJSON.Feature;
    return {
      type: "polygon",
      coordinates: geoJSON.geometry as unknown as Json,
      properties: geoJSON.properties || {},
    };
  };

  const saveOrUpdateLayer = async (layer: Layer) => {
    const shapeData = extractShapeData(layer);
    const sid = getShapeId(layer);
    if (sid) {
      await updateMapShape(sid, {
        coordinates: shapeData.coordinates,
        properties: shapeData.properties,
      });
    } else {
      const saved = await saveMapShape(shapeData);
      propagateShapeId(layer, saved.id);
      return saved;
    }
  };

  function propagateShapeId(layer: Layer, id: string) {
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

    attachPersistenceEvents(layer);
  }

  function attachPersistenceEvents(layer: Layer) {
    if (!layer || !layer.pm) return;

    layer.off("pm:change", onLayerChange);
    layer.off("pm:dragend", onLayerChange);

    layer.on("pm:change", onLayerChange);
    layer.on("pm:dragend", onLayerChange);
  }

  const onLayerChange = async (e: GeomanEvent) => {
    const layer = e.layer || e.target;
    if (layer) await saveOrUpdateLayer(layer);
  };

  const getShapeId = (layer: Layer): string | undefined => {
    return (
      layer._shapeId ||
      ((layer?.options as Record<string, unknown>)?.shapeId as
        | string
        | undefined) ||
      (layer?.feature?.properties?._shapeId as string | undefined)
    );
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/@geoman-io/leaflet-geoman-free@2.18.3/dist/leaflet-geoman.css"
      />

      {/* Control Panel */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#666" }}>
          Shapes: {shapeCount}
        </div>

        {/* Auto-save is always on; checkbox removed */}
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        #map {
          width: 100%;
          height: 100vh;
          position: relative;
        }
        /* Ensure Geoman toolbar is visible */
        .leaflet-pm-toolbar {
          z-index: 1000 !important;
        }
        
        .leaflet-pm-icon {
          background-color: white !important;
          border: 1px solid #ccc !important;
        }

        ${textMarkerStyles}
      `}</style>

      <GeomanMap onMapReady={setMapInstance} />
    </>
  );
}
