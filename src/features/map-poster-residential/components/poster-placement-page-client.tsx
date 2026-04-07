"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CONTENT_HEIGHT } from "@/lib/constants/layout";
import { usePosterPlacementMap } from "../hooks/use-poster-placement-map";
import {
  fetchCityStats,
  fetchMyPlacements,
} from "../loaders/poster-placement-loaders";
import type {
  PosterPlacement,
  PosterPlacementCityStats,
} from "../types/poster-placement-types";
import { PlacementForm } from "./placement-form";

const PosterPlacementMap = dynamic(() => import("./poster-placement-map"), {
  ssr: false,
});

type PosterPlacementPageClientProps = {
  userId: string;
  initialCityStats: PosterPlacementCityStats[];
  initialMyPlacements: PosterPlacement[];
};

export default function PosterPlacementPageClient({
  userId,
  initialCityStats,
  initialMyPlacements,
}: PosterPlacementPageClientProps) {
  const [cityStats, setCityStats] = useState(initialCityStats);
  const [myPlacements, setMyPlacements] = useState(initialMyPlacements);

  const refreshData = useCallback(async () => {
    try {
      const [updatedStats, updatedPlacements] = await Promise.all([
        fetchCityStats(),
        fetchMyPlacements(),
      ]);
      setCityStats(updatedStats);
      setMyPlacements(updatedPlacements);
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.warning("データの更新に失敗しました");
    }
  }, []);

  const {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    isLoadingAddress,
    address,
    memo,
    count,
    mode,
    showMyPins,
    setAddress,
    setMemo,
    setCount,
    setShowMyPins,
    handlePinPlaced,
    handlePlacementClick,
    handleSubmit,
    handleDelete,
    handleCancel,
  } = usePosterPlacementMap({ onSubmitSuccess: refreshData });

  return (
    <div className="relative w-full" style={{ height: CONTENT_HEIGHT }}>
      <PosterPlacementMap
        onPinPlaced={handlePinPlaced}
        onPlacementClick={handlePlacementClick}
        pinPosition={selectedPosition}
        cityStats={cityStats}
        myPlacements={myPlacements}
        showMyPins={showMyPins}
      />

      {/* トグル UI */}
      <div className="absolute top-4 right-4 z-20">
        <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-lg text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showMyPins}
            onChange={(e) => setShowMyPins(e.target.checked)}
            className="rounded"
          />
          自分のピンを表示
        </label>
      </div>

      {isFormOpen && selectedPosition && (
        <PlacementForm
          lat={selectedPosition.lat}
          lng={selectedPosition.lng}
          mode={mode}
          isSubmitting={isSubmitting}
          isLoadingAddress={isLoadingAddress}
          address={address}
          memo={memo}
          count={count}
          onAddressChange={setAddress}
          onMemoChange={setMemo}
          onCountChange={setCount}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={mode === "edit" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
