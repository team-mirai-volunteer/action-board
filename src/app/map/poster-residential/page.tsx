import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PosterPlacementPageClient from "@/features/map-poster-residential/components/poster-placement-page-client";
import {
  fetchCityStats,
  fetchMyPlacements,
} from "@/features/map-poster-residential/loaders/poster-placement-loaders";
import { getUser } from "@/features/user-profile/services/profile";

export const metadata: Metadata = {
  title: "私有地ポスターマップ",
  description: "ポスターの掲示場所を地図上で報告できます",
};

export default async function PosterPlacementPage() {
  const user = await getUser();
  if (!user) {
    return redirect("/sign-in");
  }
  let cityStats: Awaited<ReturnType<typeof fetchCityStats>> = [];
  let myPlacements: Awaited<ReturnType<typeof fetchMyPlacements>> = [];
  try {
    [cityStats, myPlacements] = await Promise.all([
      fetchCityStats(),
      fetchMyPlacements(),
    ]);
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
  return (
    <PosterPlacementPageClient
      userId={user.id}
      initialCityStats={cityStats}
      initialMyPlacements={myPlacements}
    />
  );
}
