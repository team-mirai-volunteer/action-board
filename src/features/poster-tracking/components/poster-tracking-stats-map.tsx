"use client";

import type { Map as LeafletMap } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { CityStats } from "../types/poster-tracking-types";
import { buildStatsLookup, getChoroplethColor } from "../utils/choropleth";
import { CityDetailPopup } from "./city-detail-popup";

const LeafletMapComponent = dynamic(() => import("./leaflet-map"), {
  ssr: false,
});

interface PosterTrackingStatsMapProps {
  initialStats: CityStats[];
}

export function PosterTrackingStatsMap({
  initialStats,
}: PosterTrackingStatsMapProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: GeoJSON layer type
  const geoJsonLayerRef = useRef<any>(null);
  const statsLookup = buildStatsLookup(initialStats);

  const totalPosters = initialStats.reduce((sum, s) => sum + s.total_count, 0);
  const totalCities = initialStats.length;

  const handleMapReady = useCallback((map: LeafletMap) => {
    setMapInstance(map);
  }, []);

  // Load GeoJSON and render choropleth
  useEffect(() => {
    if (!mapInstance) return;

    const loadGeoJson = async () => {
      const L = (await import("leaflet")).default;

      // Remove existing layer
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
      }

      const response = await fetch("/geojson/japan-municipalities.geojson");
      const geojsonData = await response.json();

      const geoJsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => {
          if (!feature) return {};
          const props = feature.properties;
          const city = props.city || "";
          const prefecture = props.prefecture || "";
          const stats = statsLookup.get(`${prefecture}${city}`);
          const count = stats?.total_count ?? 0;

          return {
            fillColor: getChoroplethColor(count),
            fillOpacity: count > 0 ? 0.7 : 0.2,
            color: "#6b7280",
            weight: 0.5,
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          const city = props.city || "";
          const prefecture = props.prefecture || "";
          const stats = statsLookup.get(`${prefecture}${city}`);

          if (stats && stats.total_count > 0) {
            layer.on("click", () => {
              const container = document.createElement("div");
              const root = createRoot(container);
              root.render(
                <CityDetailPopup
                  prefecture={prefecture}
                  city={city}
                  totalCount={stats.total_count}
                  contributorCount={stats.contributor_count}
                />,
              );

              layer.bindPopup(container, { maxWidth: 300 }).openPopup();
            });

            layer.on("mouseover", (e) => {
              const target = e.target;
              target.setStyle({
                weight: 2,
                color: "#1d4ed8",
                fillOpacity: 0.8,
              });
            });

            layer.on("mouseout", (e) => {
              geoJsonLayer.resetStyle(e.target);
            });

            layer.bindTooltip(`${city}: ${stats.total_count}枚`, {
              sticky: true,
            });
          }
        },
      }).addTo(mapInstance);

      geoJsonLayerRef.current = geoJsonLayer;
    };

    loadGeoJson().catch(console.error);
  }, [mapInstance, statsLookup]);

  return (
    <div className="relative">
      <LeafletMapComponent onMapReady={handleMapReady} />

      {/* Summary overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 rounded-lg shadow-md px-4 py-3">
        <div className="text-sm font-medium">ポスター掲示状況</div>
        <div className="flex gap-4 mt-1 text-xs text-gray-600">
          <span>
            合計 <strong className="text-green-600">{totalPosters}</strong>枚
          </span>
          <span>
            <strong>{totalCities}</strong>市区町村
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 rounded-lg shadow-md px-3 py-2">
        <div className="text-xs font-medium mb-1">掲示枚数</div>
        <div className="space-y-1">
          {[
            { label: "100+", color: "#16a34a" },
            { label: "51-100", color: "#22c55e" },
            { label: "21-50", color: "#4ade80" },
            { label: "6-20", color: "#86efac" },
            { label: "1-5", color: "#bbf7d0" },
            { label: "0", color: "#f3f4f6" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-sm border border-gray-300"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
