import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PosterPlacementPageClient from "@/features/poster-placement/components/poster-placement-page-client";
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
  return <PosterPlacementPageClient userId={user.id} />;
}
