import { getUserEditedBoardIdsAction } from "@/lib/actions/poster-boards";
import {
  getPosterBoardSummaryByPrefecture,
  getPosterBoardTotals,
} from "@/lib/services/poster-boards";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import AllJapanPosterMapClient from "./AllJapanPosterMapClient";

export const metadata: Metadata = {
  title: "全国ポスター掲示板マップ",
  description: "全国のポスター掲示板の配置状況を確認できます",
};

const ALL_JAPAN_CENTER: [number, number] = [36.047, 137.519];
const ALL_JAPAN_ZOOM = 6;

export default async function AllJapanPosterMapPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [summary, totals] = await Promise.all([
    getPosterBoardSummaryByPrefecture(),
    getPosterBoardTotals(),
  ]);

  const userEditedBoardIds: string[] = [];
  if (user?.id) {
  }

  return (
    <AllJapanPosterMapClient
      userId={user?.id}
      center={ALL_JAPAN_CENTER}
      defaultZoom={ALL_JAPAN_ZOOM}
      initialSummary={summary}
      initialTotals={totals}
    />
  );
}
