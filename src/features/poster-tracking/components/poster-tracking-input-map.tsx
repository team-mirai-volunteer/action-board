"use client";

import type { Map as LeafletMap, Marker } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCurrentLocation } from "@/features/map-posting/hooks/use-current-location";
import type { ReverseGeocodingResult } from "@/features/map-posting/services/reverse-geocoding";
import {
  createPlacementAction,
  deletePlacementAction,
} from "../actions/poster-placement-actions";
import { loadMyPlacements } from "../loaders/poster-placement-loaders";
import type { PosterPlacement } from "../types/poster-tracking-types";
import { MyPlacementsList } from "./my-placements-list";
import { PosterPlacementDialog } from "./poster-placement-dialog";

const LeafletMapComponent = dynamic(() => import("./leaflet-map"), {
  ssr: false,
});

interface PosterTrackingInputMapProps {
  userId: string;
}

export function PosterTrackingInputMap({
  userId,
}: PosterTrackingInputMapProps) {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedLat, setClickedLat] = useState(0);
  const [clickedLng, setClickedLng] = useState(0);
  const [geocodedAddress, setGeocodedAddress] =
    useState<ReverseGeocodingResult | null>(null);
  const [placements, setPlacements] = useState<PosterPlacement[]>([]);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const tempMarkerRef = useRef<Marker | null>(null);

  const { handleLocate } = useCurrentLocation(mapInstance, {
    flyToOnFirstLocation: true,
  });

  // Load existing placements
  useEffect(() => {
    loadMyPlacements(userId).then(setPlacements).catch(console.error);
  }, [userId]);

  // Display placement markers on map
  useEffect(() => {
    if (!mapInstance) return;

    const addMarkers = async () => {
      const L = (await import("leaflet")).default;

      // Clear old markers
      for (const marker of Array.from(markersRef.current.values())) {
        marker.remove();
      }
      markersRef.current.clear();

      // Add markers for each placement
      for (const p of placements) {
        const marker = L.marker([p.lat, p.lng])
          .addTo(mapInstance)
          .bindTooltip(`${p.poster_count}枚`, {
            permanent: true,
            direction: "top",
            className:
              "bg-green-600 text-white text-xs px-1 py-0 rounded border-0",
          });
        markersRef.current.set(p.id, marker);
      }
    };

    addMarkers();
  }, [mapInstance, placements]);

  // Handle map click to place pin
  const handleMapReady = useCallback((map: LeafletMap) => {
    setMapInstance(map);

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      setClickedLat(lat);
      setClickedLng(lng);

      // Show temporary marker
      const L = (await import("leaflet")).default;
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
      }
      const tempMarker = L.marker([lat, lng], {
        opacity: 0.7,
      }).addTo(map);
      tempMarkerRef.current = tempMarker;

      // Reverse geocode
      setGeocodedAddress(null);
      try {
        const { reverseGeocode } = await import(
          "@/features/map-posting/services/reverse-geocoding"
        );
        const result = await reverseGeocode(lat, lng);
        setGeocodedAddress(result);
      } catch {
        setGeocodedAddress({
          prefecture: null,
          city: null,
          address: null,
          postcode: null,
        });
      }

      setDialogOpen(true);
    });
  }, []);

  const handleSubmit = async (data: {
    lat: number;
    lng: number;
    poster_count: number;
    address?: string;
    note?: string;
  }) => {
    try {
      const newPlacement = await createPlacementAction(data);
      setPlacements((prev) => [newPlacement, ...prev]);
      toast.success("掲示を記録しました");
    } catch {
      toast.error("記録に失敗しました");
      throw new Error("記録に失敗しました");
    } finally {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlacementAction(id);
      setPlacements((prev) => prev.filter((p) => p.id !== id));
      const marker = markersRef.current.get(id);
      if (marker) {
        marker.remove();
        markersRef.current.delete(id);
      }
      toast.success("記録を削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleFlyTo = (lat: number, lng: number) => {
    mapInstance?.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open && tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  };

  return (
    <div className="relative">
      <LeafletMapComponent onMapReady={handleMapReady} />

      {/* Locate button */}
      <button
        type="button"
        onClick={handleLocate}
        className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-2 hover:bg-gray-100 transition-colors"
        title="現在地に移動"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
        >
          <title>現在地に移動</title>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      {/* Instruction overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 rounded-lg shadow-md px-3 py-2 text-sm text-gray-700">
        地図をタップしてポスターを掲示した場所を記録
      </div>

      {/* My placements panel */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-3 max-w-md mx-auto">
        <h3 className="font-medium text-sm mb-2">
          あなたの掲示記録（{placements.length}件）
        </h3>
        <MyPlacementsList
          placements={placements}
          onDelete={handleDelete}
          onFlyTo={handleFlyTo}
        />
      </div>

      <PosterPlacementDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        lat={clickedLat}
        lng={clickedLng}
        geocodedAddress={geocodedAddress}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
