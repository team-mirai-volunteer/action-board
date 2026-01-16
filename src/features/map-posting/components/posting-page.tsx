"use client";

import type { Json } from "@/lib/types/supabase";
import type { Layer, Map as LeafletMap, Marker } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addButtonLabel,
  geomanJaLang,
  geomanPathOptions,
  postingGeomanControls,
} from "../config/geoman-config";
import {
  CLUSTER_THRESHOLD_ZOOM,
  type PostingShapeStatus,
  postingStatusConfig,
  postingStatusLabels,
} from "../config/status-config";
import { useCurrentLocation } from "../hooks/use-current-location";
import {
  deleteShape as deleteMapShape,
  loadShapes as loadMapShapes,
  saveShape as saveMapShape,
  updateShape as updateMapShape,
} from "../services/posting-shapes";
import type { MarkerWithShape } from "../types/posting-types";
import type {
  GeomanEvent,
  LeafletWindow,
  MapShape as MapShapeData,
  PolygonProperties,
  PostingPageClientProps,
  TextCoordinates,
} from "../types/posting-types";
import {
  countStatusesFromMarkers,
  createClusterIcon,
  createMarkerIcon,
} from "../utils/cluster-icon";
import { toggleDisplayMode } from "../utils/display-mode";
import { createPostingLabelIcon } from "../utils/posting-label";
import { applyStatusStyle, getShapeId } from "../utils/shape-layer-utils";
import { PostingControlPanel } from "./posting-control-panel";
import { ShapeStatusDialog } from "./shape-status-dialog";

const GeomanMap = dynamic(() => import("./geoman-map"), {
  ssr: false,
});

export default function PostingPageClient({
  userId,
  eventId,
  eventTitle,
  isAdmin,
}: PostingPageClientProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [showText, setShowText] = useState(true);
  const textLayersRef = useRef<Set<Layer>>(new Set());
  const showTextRef = useRef(showText);
  const autoSave = true;

  // Dialog state for status change
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<MapShapeData | null>(null);
  // Track shapes data for status updates
  const shapesDataRef = useRef<Map<string, MapShapeData>>(new Map());
  // Track polygon layers for status color updates
  const polygonLayersRef = useRef<Map<string, Layer>>(new Map());
  // Track posting count label layers
  const postingLabelLayersRef = useRef<Map<string, Layer>>(new Map());
  // Track marker cluster group
  // biome-ignore lint/suspicious/noExplicitAny: MarkerClusterGroup type not available
  const markerClusterRef = useRef<any>(null);
  // Track polygon layer group for visibility toggle
  // biome-ignore lint/suspicious/noExplicitAny: LayerGroup type from dynamic import
  const polygonLayerGroupRef = useRef<any>(null);
  // Track all cluster markers for filtering
  const clusterMarkersRef = useRef<Map<string, MarkerWithShape>>(new Map());
  // Track current zoom level for display mode
  const [isClusterMode, setIsClusterMode] = useState(true);
  // Ref to track isClusterMode for use in event handlers
  const isClusterModeRef = useRef(isClusterMode);
  // Current location hook
  const { currentPos, handleLocate } = useCurrentLocation(mapInstance);
  // Total posting count
  const [totalPostingCount, setTotalPostingCount] = useState<number>();
  // Filter: show only my shapes
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // Keep refs in sync with state
  useEffect(() => {
    showTextRef.current = showText;
  }, [showText]);

  useEffect(() => {
    isClusterModeRef.current = isClusterMode;
  }, [isClusterMode]);

  // Apply filter when showOnlyMine changes
  useEffect(() => {
    if (!mapInstance || !markerClusterRef.current) return;

    const L = (window as LeafletWindow).L;
    if (!L) return;

    // Update polygon visibility
    for (const [shapeId, layer] of Array.from(
      polygonLayersRef.current.entries(),
    )) {
      const shapeData = shapesDataRef.current.get(shapeId);
      const isOwner = shapeData?.user_id === userId;
      const shouldShow = !showOnlyMine || isOwner;

      if (shouldShow) {
        if (
          polygonLayerGroupRef.current &&
          !polygonLayerGroupRef.current.hasLayer(layer)
        ) {
          polygonLayerGroupRef.current.addLayer(layer);
        }
      } else {
        if (polygonLayerGroupRef.current?.hasLayer(layer)) {
          polygonLayerGroupRef.current.removeLayer(layer);
        }
      }

      // Update posting count label visibility
      const label = postingLabelLayersRef.current.get(shapeId);
      if (label) {
        if (shouldShow && !isClusterMode) {
          if (!mapInstance.hasLayer(label)) {
            label.addTo(mapInstance);
          }
        } else {
          if (mapInstance.hasLayer(label)) {
            mapInstance.removeLayer(label);
          }
        }
      }
    }

    // Update cluster markers by adding/removing from cluster group
    for (const [shapeId, marker] of Array.from(
      clusterMarkersRef.current.entries(),
    )) {
      const shapeData = shapesDataRef.current.get(shapeId);
      const isOwner = shapeData?.user_id === userId;
      const shouldShow = !showOnlyMine || isOwner;

      if (shouldShow) {
        if (!markerClusterRef.current.hasLayer(marker)) {
          markerClusterRef.current.addLayer(marker);
        }
      } else {
        if (markerClusterRef.current.hasLayer(marker)) {
          markerClusterRef.current.removeLayer(marker);
        }
      }
    }

    // Recalculate total posting count based on filter
    let total = 0;
    for (const shape of Array.from(shapesDataRef.current.values())) {
      const isOwner = shape.user_id === userId;
      if (!showOnlyMine || isOwner) {
        total += shape.posting_count || 0;
      }
    }
    setTotalPostingCount(total);
  }, [showOnlyMine, mapInstance, userId, isClusterMode]);

  useEffect(() => {
    if (!mapInstance) return;

    // Refs for display mode toggle (defined at useEffect level for access by nested functions)
    const displayModeRefs = {
      polygonLayerGroupRef,
      markerClusterRef,
      postingLabelLayersRef,
    };

    const initializePostingMap = async () => {
      let L: typeof import("leaflet");

      try {
        L = (await import("leaflet")).default;
        // Load markercluster plugin
        await import("leaflet.markercluster");
      } catch (error) {
        console.error("Failed to load Leaflet in PostingPageClient:", error);
        toast.error(
          "地図ライブラリの読み込みに失敗しました。ページを再読み込みしてください。",
        );
        return;
      }

      // Initialize polygon layer group
      polygonLayerGroupRef.current = L.layerGroup();

      // Initialize marker cluster group
      markerClusterRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: createClusterIcon,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        chunkedLoading: true,
        removeOutsideVisibleBounds: true,
        spiderfyOnMaxZoom: true,
        spiderfyDistanceMultiplier: 2,
      });

      // Add cluster tooltip events
      markerClusterRef.current.on(
        "clustermouseover",
        // biome-ignore lint/suspicious/noExplicitAny: Leaflet cluster event type
        (e: any) => {
          const cluster = e.propagatedFrom;
          const markers = cluster.getAllChildMarkers() as MarkerWithShape[];
          const { statusCounts, totalPostingCount } =
            countStatusesFromMarkers(markers);

          const tooltipLines = Object.entries(statusCounts)
            .filter(([, count]) => count > 0)
            .map(
              ([status, count]) =>
                `${postingStatusLabels[status as PostingShapeStatus]}: ${count}`,
            );

          if (totalPostingCount > 0) {
            tooltipLines.push(`合計配布枚数: ${totalPostingCount}枚`);
          }

          cluster
            .bindTooltip(
              `エリア数: ${cluster.getChildCount()}<br>${tooltipLines.join("<br>")}`,
              { permanent: false, direction: "top" },
            )
            .openTooltip();
        },
      );

      markerClusterRef.current.on(
        "clustermouseout",
        // biome-ignore lint/suspicious/noExplicitAny: Leaflet cluster event type
        (e: any) => {
          e.propagatedFrom.closeTooltip();
        },
      );

      // Add cluster group to map (initially visible)
      mapInstance.addLayer(markerClusterRef.current);

      // Set up zoom event listener for display mode toggle
      mapInstance.on("zoomend", () => {
        const zoom = mapInstance.getZoom();
        const shouldBeClusterMode = zoom < CLUSTER_THRESHOLD_ZOOM;

        if (shouldBeClusterMode !== isClusterModeRef.current) {
          setIsClusterMode(shouldBeClusterMode);
          toggleDisplayMode(mapInstance, shouldBeClusterMode, displayModeRefs);
        }
      });

      // Check initial zoom level
      const initialZoom = mapInstance.getZoom();
      const initialClusterMode = initialZoom < CLUSTER_THRESHOLD_ZOOM;
      setIsClusterMode(initialClusterMode);

      try {
        L.tileLayer(
          "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution:
              '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
          },
        ).addTo(mapInstance);
      } catch (error) {
        console.error("Failed to add tile layer:", error);
        toast.error(
          "地図タイルの読み込みに失敗しました。インターネット接続を確認してください。",
        );
        // Continue without tiles - the map will still be functional for drawing
      }

      // Geoman ツールチップの日本語化
      mapInstance.pm.setLang("ja", geomanJaLang);
      mapInstance.pm.setLang("ja");

      mapInstance.pm.addControls(postingGeomanControls);

      // ツールバーボタンにラベルを追加
      addButtonLabel(
        ".leaflet-pm-draw .leaflet-buttons-control-button",
        "エリア選択",
      );

      mapInstance.on("pm:create", async (e: GeomanEvent) => {
        if (e.layer) {
          // Check if it's a text layer
          const shapeName = e.layer.pm?.getShape
            ? e.layer.pm.getShape()
            : undefined;
          if (shapeName === "Text") {
            e.layer._isTextLayer = true;
            textLayersRef.current.add(e.layer);
            // Hide if text is toggled off
            if (!showTextRef.current && e.layer) {
              const layerToRemove = e.layer;
              setTimeout(() => mapInstance.removeLayer(layerToRemove), 0);
            }
          }

          const saved = await saveOrUpdateLayer(e.layer);
          attachTextEvents(e.layer);

          // For polygon shapes, track and attach click event
          if (shapeName !== "Text" && saved?.id) {
            // Store shape data for status dialog
            const shapeData = extractShapeData(e.layer);
            shapeData.id = saved.id;
            // Get center coordinates from saved data
            if (saved.lat && saved.lng) {
              shapeData.lat = saved.lat;
              shapeData.lng = saved.lng;
            }
            shapesDataRef.current.set(saved.id, shapeData);

            // Track polygon layer
            polygonLayersRef.current.set(saved.id, e.layer);

            // Apply default status style
            applyStatusStyle(e.layer, "planned");

            // Add to polygon layer group
            if (polygonLayerGroupRef.current) {
              // Remove from map and add to layer group
              mapInstance.removeLayer(e.layer);
              polygonLayerGroupRef.current.addLayer(e.layer);
              // If in polygon mode, show it
              if (!isClusterModeRef.current) {
                e.layer.addTo(mapInstance);
              }
            }

            // Create marker for clustering
            if (saved.lat && saved.lng && markerClusterRef.current) {
              const marker = L.marker([saved.lat, saved.lng], {
                icon: createMarkerIcon(L, "planned"),
              }) as MarkerWithShape;
              marker.shapeData = {
                id: saved.id,
                status: "planned",
                posting_count: null,
                lat: saved.lat,
                lng: saved.lng,
              };
              marker.on("click", () => {
                if (saved.lat !== null && saved.lng !== null) {
                  mapInstance.setView(
                    [saved.lat, saved.lng],
                    CLUSTER_THRESHOLD_ZOOM,
                  );
                }
              });
              markerClusterRef.current.addLayer(marker);
              // Track marker for filtering
              clusterMarkersRef.current.set(saved.id, marker);
            }

            // Attach click event for status dialog
            e.layer.on("click", () => {
              handlePolygonClick(saved.id as string);
            });
          }
        }
      });

      mapInstance.on("pm:remove", async (e: GeomanEvent) => {
        const layer = e.layer;
        if (layer) {
          const sid = getShapeId(layer);

          // 削除確認ダイアログを表示
          const confirmed = window.confirm(
            "この図形を削除しますか？\n削除すると元に戻せません。",
          );

          if (!confirmed) {
            // キャンセルされた場合はレイヤーを復元
            layer.addTo(mapInstance);
            return;
          }

          // Remove from text layers tracking if it's a text layer
          if (layer._isTextLayer) {
            textLayersRef.current.delete(layer);
          }

          if (sid) {
            await handleDeleteShape(sid);
          }
          toast.success("図形を削除しました");
        }
      });

      mapInstance.on("pm:update", async (e: GeomanEvent) => {
        if (e.layer) {
          await saveOrUpdateLayer(e.layer);
        }
      });

      mapInstance.pm.setPathOptions(geomanPathOptions);

      loadExistingShapes();
    };

    // Add posting count label for completed polygon
    const addPostingCountLabel = (
      L: typeof import("leaflet"),
      shapeId: string,
      lat: number,
      lng: number,
      postingCount: number,
    ) => {
      const icon = createPostingLabelIcon(L, postingCount);
      const labelMarker = L.marker([lat, lng], { icon, interactive: false });
      postingLabelLayersRef.current.set(shapeId, labelMarker);
      return labelMarker;
    };

    const loadExistingShapes = async () => {
      try {
        const savedShapes = await loadMapShapes(eventId);

        let L: typeof import("leaflet");
        try {
          L = (await import("leaflet")).default;
        } catch (error) {
          console.error("Failed to load Leaflet for shapes:", error);
          toast.error("保存された図形の読み込みに失敗しました。");
          return;
        }

        const markers: Marker[] = [];

        for (const shape of savedShapes) {
          try {
            let layer: Layer | undefined;

            // Store shape data for status dialog
            if (shape.id) {
              shapesDataRef.current.set(shape.id, shape as MapShapeData);
            }

            if (shape.type === "text") {
              const coords = shape.coordinates as unknown as TextCoordinates;
              const [lng, lat] = coords.coordinates;
              const text = (shape.properties as { text?: string })?.text || "";
              layer = L.marker([lat, lng], {
                textMarker: true,
                text,
              } as L.MarkerOptions) as unknown as Layer;
              layer._shapeId = shape.id; // preserve id
              layer._isTextLayer = true; // Mark as text layer for toggle
              attachTextEvents(layer);
            } else if (shape.type === "polygon") {
              // Get status config for styling
              const status = (shape.status as PostingShapeStatus) || "planned";
              const statusConfig = postingStatusConfig[status];

              layer = L.geoJSON(
                shape.coordinates as unknown as GeoJSON.Polygon,
                {
                  style: {
                    color: statusConfig.color,
                    fillColor: statusConfig.fillColor,
                    fillOpacity: statusConfig.fillOpacity,
                  },
                },
              ) as unknown as Layer;
              layer._shapeId = shape.id; // preserve id

              // Track polygon layer for status updates
              if (shape.id) {
                polygonLayersRef.current.set(shape.id, layer);
              }

              // Add to polygon layer group instead of directly to map
              if (polygonLayerGroupRef.current) {
                polygonLayerGroupRef.current.addLayer(layer);
              }

              // Create marker for clustering (using center coordinates)
              if (shape.lat && shape.lng && shape.id) {
                const marker = L.marker([shape.lat, shape.lng], {
                  icon: createMarkerIcon(L, status, shape.posting_count),
                }) as MarkerWithShape;
                marker.shapeData = {
                  id: shape.id,
                  status,
                  posting_count: shape.posting_count,
                  lat: shape.lat,
                  lng: shape.lng,
                };
                // Click to zoom in and show polygon
                marker.on("click", () => {
                  if (mapInstance) {
                    mapInstance.setView(
                      [shape.lat as number, shape.lng as number],
                      CLUSTER_THRESHOLD_ZOOM,
                    );
                  }
                });
                markers.push(marker);
                // Track marker for filtering
                clusterMarkersRef.current.set(shape.id, marker);

                // Add posting count label for completed polygons
                if (
                  status === "completed" &&
                  shape.posting_count &&
                  shape.posting_count > 0
                ) {
                  addPostingCountLabel(
                    L,
                    shape.id,
                    shape.lat,
                    shape.lng,
                    shape.posting_count,
                  );
                }
              }
            }

            if (layer) {
              // For text layers, add directly to map
              if (layer._isTextLayer) {
                layer.addTo(mapInstance);
                textLayersRef.current.add(layer);
                // Apply initial text visibility state
                if (!showTextRef.current) {
                  mapInstance.removeLayer(layer);
                }
              }

              propagateShapeId(layer, shape.id);

              if (
                shape.type === "text" ||
                (shape.properties as PolygonProperties)?.originalType === "Text"
              ) {
                attachTextEvents(layer);
              }

              // Attach click event for polygon shapes to open status dialog
              if (shape.type === "polygon" && shape.id) {
                // Need to access the actual path layer inside GeoJSON layer group
                if (
                  "eachLayer" in layer &&
                  typeof layer.eachLayer === "function"
                ) {
                  (
                    layer as Layer & {
                      eachLayer: (fn: (l: Layer) => void) => void;
                    }
                  ).eachLayer((subLayer: Layer) => {
                    subLayer.on("click", () => {
                      handlePolygonClick(shape.id as string);
                    });
                  });
                }
              }
            }
          } catch (layerError) {
            console.error(
              "Failed to create layer for shape:",
              shape,
              layerError,
            );
          }
        }

        // Add all markers to cluster group
        if (markerClusterRef.current && markers.length > 0) {
          markerClusterRef.current.addLayers(markers);
        }

        // Set initial display mode based on zoom level
        const initialZoom = mapInstance.getZoom();
        const initialClusterMode = initialZoom < CLUSTER_THRESHOLD_ZOOM;
        toggleDisplayMode(mapInstance, initialClusterMode, displayModeRefs);

        // Calculate total posting count
        const total = savedShapes.reduce((sum, shape) => {
          return sum + (shape.posting_count || 0);
        }, 0);
        setTotalPostingCount(total);
      } catch (error) {
        console.error("Failed to load existing shapes:", error);
      }
    };

    initializePostingMap();

    // Esc キーで描画モードをキャンセル
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        mapInstance.pm.disableDraw();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mapInstance, eventId]);

  const textMarkerStyles = `
    .pm-text {
      font-size:14px;
      color:#000;
    }
    /* Geoman アクションボタンを非表示 */
    .leaflet-pm-action.action-finish,
    .leaflet-pm-action.action-removeLastVertex {
      display: none !important;
    }
  `;

  // 図形削除の共通処理
  const handleDeleteShape = async (
    shapeId: string,
    options?: { layer?: Layer; removeFromMap?: boolean },
  ) => {
    await deleteMapShape(shapeId);

    // モーダルからの削除の場合はマップからレイヤーを削除
    if (options?.removeFromMap) {
      const layer = options.layer || polygonLayersRef.current.get(shapeId);
      if (layer && mapInstance) {
        mapInstance.removeLayer(layer);
        // Also remove from polygon layer group
        if (polygonLayerGroupRef.current) {
          polygonLayerGroupRef.current.removeLayer(layer);
        }
      }
    }

    // Remove posting count label if exists
    const label = postingLabelLayersRef.current.get(shapeId);
    if (label && mapInstance) {
      mapInstance.removeLayer(label);
      postingLabelLayersRef.current.delete(shapeId);
    }

    // Clean up tracking refs
    shapesDataRef.current.delete(shapeId);
    polygonLayersRef.current.delete(shapeId);
  };

  function attachTextEvents(layer: Layer) {
    if (!layer?.pm) return;

    layer._isTextLayer = true; // Mark as text layer
    textLayersRef.current.add(layer); // Add to tracking

    layer.off("pm:textchange");
    layer.off("pm:textblur");

    layer.on("pm:textchange", () => {
      layer._textDirty = true;
    });

    layer.on("pm:textblur", () => {
      if (layer._textDirty) {
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
        event_id: eventId,
        user_id: userId,
      };
    }

    // Default to polygon for all other shapes
    const geoJSON = layer.toGeoJSON() as GeoJSON.Feature;
    return {
      type: "polygon",
      coordinates: geoJSON.geometry as unknown as Json,
      properties: geoJSON.properties || {},
      event_id: eventId,
      user_id: userId,
      status: "planned", // Default status for new shapes
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
    if (!layer?.pm) return;

    layer.off("pm:change", onLayerChange);
    layer.off("pm:dragend", onLayerChange);

    layer.on("pm:change", onLayerChange);
    layer.on("pm:dragend", onLayerChange);
  }

  const onLayerChange = async (e: GeomanEvent) => {
    const layer = e.layer || e.target;
    if (layer) await saveOrUpdateLayer(layer);
  };

  // Handle polygon click to open status dialog
  const handlePolygonClick = useCallback(
    (shapeId: string) => {
      // Don't open dialog if any Geoman tool/mode is active
      if (mapInstance?.pm) {
        // biome-ignore lint/suspicious/noExplicitAny: Geoman methods not in type definitions
        const pm = mapInstance.pm as any;
        if (
          pm.globalEditModeEnabled?.() ||
          pm.globalDragModeEnabled?.() ||
          pm.globalRemovalModeEnabled?.() ||
          pm.globalDrawModeEnabled?.()
        ) {
          return;
        }
      }

      const shapeData = shapesDataRef.current.get(shapeId);
      if (shapeData) {
        setSelectedShape(shapeData);
        setIsStatusDialogOpen(true);
      }
    },
    [mapInstance],
  );

  // Handle status update from dialog
  const handleStatusUpdated = useCallback(
    (
      shapeId: string,
      newStatus: PostingShapeStatus,
      newMemo: string | null,
      postingCount?: number | null,
    ) => {
      // Update the shapes data ref
      const shapeData = shapesDataRef.current.get(shapeId);
      if (shapeData) {
        shapeData.status = newStatus;
        shapeData.memo = newMemo;
        shapeData.posting_count = postingCount;
        shapesDataRef.current.set(shapeId, shapeData);
      }

      // Update the layer style
      const layer = polygonLayersRef.current.get(shapeId);
      if (layer) {
        applyStatusStyle(layer, newStatus);
      }

      // Update posting count label
      // biome-ignore lint/suspicious/noExplicitAny: window.L type
      const L = (window as any).L;
      if (!L) return;

      // Remove existing label if any
      const existingLabel = postingLabelLayersRef.current.get(shapeId);
      if (existingLabel && mapInstance) {
        mapInstance.removeLayer(existingLabel);
        postingLabelLayersRef.current.delete(shapeId);
      }

      // Add new label if completed with posting count
      if (
        newStatus === "completed" &&
        postingCount &&
        postingCount > 0 &&
        shapeData?.lat &&
        shapeData?.lng
      ) {
        const icon = createPostingLabelIcon(L, postingCount);
        const labelMarker = L.marker([shapeData.lat, shapeData.lng], {
          icon,
          interactive: false,
        });
        postingLabelLayersRef.current.set(shapeId, labelMarker);

        // Only add to map if not in cluster mode
        if (!isClusterMode && mapInstance) {
          labelMarker.addTo(mapInstance);
        }
      }

      // Recalculate total posting count
      let total = 0;
      for (const shape of Array.from(shapesDataRef.current.values())) {
        total += shape.posting_count || 0;
      }
      setTotalPostingCount(total);
    },
    [mapInstance, isClusterMode],
  );

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
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
      />

      <PostingControlPanel
        eventTitle={eventTitle}
        totalPostingCount={totalPostingCount}
        showOnlyMine={showOnlyMine}
        onShowOnlyMineChange={setShowOnlyMine}
      />

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        #map {
          width: 100%;
          height: 100vh;
          position: relative;
          z-index:  40;
        }
        /* Ensure Geoman toolbar is visible */
        .leaflet-pm-toolbar {
          z-index: 1000 !important;
        }

        .leaflet-pm-icon {
          background-color: white !important;
          border: 1px solid #ccc !important;
        }

        /* ツールバーボタンにテキストラベルを追加 */
        .leaflet-pm-toolbar .leaflet-buttons-control-button {
          width: auto !important;
          padding: 0 10px !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px;
        }
        .leaflet-pm-toolbar .leaflet-buttons-control-button .pm-btn-label {
          font-size: 12px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
          color: #333;
        }
        .leaflet-pm-toolbar .leaflet-pm-icon {
          flex-shrink: 0;
        }
        .leaflet-pm-icon-polygon {
          width: 16px !important;
          height: 16px !important;
        }

        /* Posting count label styles */
        .posting-count-label {
          background: rgba(16, 185, 129, 0.95);
          color: white;
          font-size: 12px;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 10px;
          white-space: nowrap;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          border: 2px solid white;
        }
        .posting-count-marker {
          z-index: 600 !important;
        }

        /* Cluster and marker styles */
        .posting-marker {
          z-index: 500 !important;
        }
        .posting-cluster {
          z-index: 400 !important;
        }
        .leaflet-marker-icon.posting-marker,
        .leaflet-marker-icon.posting-cluster {
          background: transparent !important;
          border: none !important;
        }

        ${textMarkerStyles}
      `}</style>

      <GeomanMap onMapReady={setMapInstance} />

      {/* Current location button */}
      <button
        type="button"
        onClick={handleLocate}
        disabled={!currentPos}
        className={`fixed right-4 bottom-4 rounded-full shadow px-4 py-2 font-bold border transition-colors ${
          currentPos
            ? "bg-white border-blue-500 text-blue-600 hover:bg-blue-50"
            : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
        }`}
        style={{ zIndex: 1000 }}
        aria-label="現在地を表示"
      >
        📍 現在地
      </button>

      {/* Status Change Dialog */}
      <ShapeStatusDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        shape={selectedShape}
        currentUserId={userId}
        isAdmin={isAdmin}
        onStatusUpdated={handleStatusUpdated}
        onDelete={async (id) => {
          await handleDeleteShape(id, { removeFromMap: true });
        }}
      />
    </>
  );
}
