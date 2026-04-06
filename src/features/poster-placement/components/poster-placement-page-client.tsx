"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { CONTENT_HEIGHT } from "@/lib/constants/layout";
import { usePosterPlacementMap } from "../hooks/use-poster-placement-map";
import { fetchCityStats } from "../loaders/poster-placement-loaders";
import type { PosterPlacementCityStats } from "../types/poster-placement-types";
import { PlacementForm } from "./placement-form";

const PosterPlacementMap = dynamic(() => import("./poster-placement-map"), {
  ssr: false,
});

// Props型はファイル内定義（アーキテクチャガイドライン準拠）
type PosterPlacementPageClientProps = {
  userId: string;
  initialCityStats: PosterPlacementCityStats[];
};

export default function PosterPlacementPageClient({
  userId,
  initialCityStats,
}: PosterPlacementPageClientProps) {
  const [cityStats, setCityStats] = useState(initialCityStats);

  // 登録成功後に集計データを再フェッチする
  const refreshCityStats = useCallback(async () => {
    const updated = await fetchCityStats();
    setCityStats(updated);
  }, []);

  const {
    selectedPosition,
    isFormOpen,
    isSubmitting,
    addressInfo,
    isLoadingAddress,
    handlePinPlaced,
    handleSubmit,
    handleCancel,
  } = usePosterPlacementMap({ onSubmitSuccess: refreshCityStats });

  return (
    <div className="relative w-full" style={{ height: CONTENT_HEIGHT }}>
      <PosterPlacementMap
        onPinPlaced={handlePinPlaced}
        pinPosition={selectedPosition}
        cityStats={cityStats}
      />
      {isFormOpen && selectedPosition && (
        <PlacementForm
          lat={selectedPosition.lat}
          lng={selectedPosition.lng}
          isSubmitting={isSubmitting}
          addressInfo={addressInfo}
          isLoadingAddress={isLoadingAddress}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
