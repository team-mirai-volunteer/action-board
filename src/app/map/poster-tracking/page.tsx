import type { Metadata } from "next";
import { PosterTrackingPageClient } from "@/features/poster-tracking/components/poster-tracking-page-client";
import { loadStatsByCity } from "@/features/poster-tracking/loaders/poster-placement-loaders";
import { getUser } from "@/features/user-profile/services/profile";

export const metadata: Metadata = {
  title: "ポスター掲示トラッキング",
  description: "ポスター掲示の記録と市区町村別の集計マップ",
};

export default async function PosterTrackingPage() {
  const user = await getUser();
  const stats = await loadStatsByCity();

  return (
    <PosterTrackingPageClient userId={user?.id ?? null} initialStats={stats} />
  );
}
