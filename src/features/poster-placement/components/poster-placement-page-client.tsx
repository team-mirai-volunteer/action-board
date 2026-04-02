"use client";

import dynamic from "next/dynamic";
import { CONTENT_HEIGHT } from "@/lib/constants/layout";
import { usePosterPlacementMap } from "../hooks/use-poster-placement-map";
import { PlacementForm } from "./placement-form";

const PosterPlacementMap = dynamic(() => import("./poster-placement-map"), {
  ssr: false,
});

export default function PosterPlacementPageClient({
  userId,
}: {
  userId: string;
}) {
  const {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    handlePinPlaced,
    handleSubmit,
    handleCancel,
  } = usePosterPlacementMap();

  return (
    <div className="relative" style={{ height: CONTENT_HEIGHT }}>
      <PosterPlacementMap
        onPinPlaced={handlePinPlaced}
        pinPosition={selectedPosition}
      />
      {isFormOpen && selectedPosition && (
        <PlacementForm
          lat={selectedPosition.lat}
          lng={selectedPosition.lng}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
