"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { CONTENT_HEIGHT, HEADER_HEIGHT } from "@/lib/constants/layout";
import { usePosterPlacementMap } from "../hooks/use-residential-poster-map";
import {
  fetchCityStats,
  fetchMyPlacements,
} from "../loaders/residential-poster-loaders";
import type {
  ResidentialPosterCityStats,
  ResidentialPosterPlacement,
} from "../types/residential-poster-types";
import { PlacementForm } from "./residential-poster-form";

const PosterPlacementMap = dynamic(() => import("./residential-poster-map"), {
  ssr: false,
});

type PosterPlacementPageClientProps = {
  userId: string;
  initialCityStats: ResidentialPosterCityStats[];
  initialMyPlacements: ResidentialPosterPlacement[];
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
    placedDate,
    locationType,
    posterType,
    isRemoved,
    confirmedOrdinance,
    confirmedLandowner,
    mode,
    showMyPins,
    setAddress,
    setMemo,
    setCount,
    setPlacedDate,
    setLocationType,
    setPosterType,
    setIsRemoved,
    setConfirmedOrdinance,
    setConfirmedLandowner,
    setShowMyPins,
    handlePinPlaced,
    handlePlacementClick,
    handleSubmit,
    handleDelete,
    handleCancel,
  } = usePosterPlacementMap({ onSubmitSuccess: refreshData });

  return (
    <div className="w-full">
      <div className="space-y-1 px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold">私有地ポスターマップ</h1>
        <a
          href="https://docs.google.com/document/d/1Wru0CkA_c3YDhYV3S8pXZnl0EnBZ16smpc60ulSPi9E/edit?tab=t.0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          ガイドラインはこちら
        </a>
      </div>
      <div className="relative w-full" style={{ height: CONTENT_HEIGHT }}>
        {/* フローティングトグル - sticky でスクロール追従、マップ領域内に制約 */}
        <div
          className="sticky z-20 pointer-events-none"
          style={{ top: `${HEADER_HEIGHT}px`, height: 0 }}
        >
          <div className="flex justify-end pr-4 pt-4">
            <label
              htmlFor="show-my-pins"
              className="pointer-events-auto flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-lg text-sm cursor-pointer"
            >
              <Checkbox
                id="show-my-pins"
                checked={showMyPins}
                onCheckedChange={(checked) => setShowMyPins(checked === true)}
              />
              自分のピンを表示
            </label>
          </div>
        </div>

        <PosterPlacementMap
          onPinPlaced={handlePinPlaced}
          onPlacementClick={handlePlacementClick}
          pinPosition={selectedPosition}
          cityStats={cityStats}
          myPlacements={myPlacements}
          showMyPins={showMyPins}
        />

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
            placedDate={placedDate}
            locationType={locationType}
            posterType={posterType}
            isRemoved={isRemoved}
            confirmedOrdinance={confirmedOrdinance}
            confirmedLandowner={confirmedLandowner}
            onAddressChange={setAddress}
            onMemoChange={setMemo}
            onCountChange={setCount}
            onPlacedDateChange={setPlacedDate}
            onLocationTypeChange={setLocationType}
            onPosterTypeChange={setPosterType}
            onIsRemovedChange={setIsRemoved}
            onConfirmedOrdinanceChange={setConfirmedOrdinance}
            onConfirmedLandownerChange={setConfirmedLandowner}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={mode === "edit" ? handleDelete : undefined}
          />
        )}
      </div>
    </div>
  );
}
