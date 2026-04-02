import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PosterPlacementPageClient from "@/features/poster-placement/components/poster-placement-page-client";
import { fetchCityStats } from "@/features/poster-placement/loaders/poster-placement-loaders";
import { getUser } from "@/features/user-profile/services/profile";

export const metadata: Metadata = {
  title: "ポスター掲示マップ",
  description: "ポスターの掲示場所を地図上で報告できます",
};

export default async function PosterPlacementPage() {
  const user = await getUser();
  if (!user) {
    return redirect("/sign-in");
  }
  // サーバーサイドで集計データをフェッチし、初期データとして渡す
  const cityStats = await fetchCityStats();
  return (
    <PosterPlacementPageClient userId={user.id} initialCityStats={cityStats} />
  );
}
