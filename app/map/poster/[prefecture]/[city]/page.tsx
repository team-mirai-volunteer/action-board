import {
  POSTER_PREFECTURE_MAP,
  type PosterPrefectureKey,
} from "@/lib/constants/poster-prefectures";
import {
  getCitiesByPrefecture,
  getPosterBoardsByCity,
} from "@/lib/services/poster-boards";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CityPosterMapClient } from "./CityPosterMapClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string; city: string }>;
}): Promise<Metadata> {
  const { prefecture, city } = await params;
  const prefectureKey = prefecture as PosterPrefectureKey;
  const prefectureData = POSTER_PREFECTURE_MAP[prefectureKey];
  const prefectureName = prefectureData?.jp || prefecture;
  const decodedCity = decodeURIComponent(city);

  return {
    title: `${prefectureName} ${decodedCity}のポスター掲示板マップ`,
    description: `${prefectureName} ${decodedCity}のポスター掲示板の配置状況を確認できます`,
  };
}

export async function generateStaticParams() {
  const validPrefectures = Object.keys(
    POSTER_PREFECTURE_MAP,
  ) as PosterPrefectureKey[];
  const params = [];

  for (const prefecture of validPrefectures) {
    const prefectureData = POSTER_PREFECTURE_MAP[prefecture];
    try {
      const cities = await getCitiesByPrefecture(prefectureData.jp);
      for (const city of cities) {
        params.push({
          prefecture,
          city: encodeURIComponent(city),
        });
      }
    } catch (error) {
      console.error(`Error fetching cities for ${prefecture}:`, error);
    }
  }

  return params;
}

const validPrefectures = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];

export default async function CityPosterMapPage({
  params,
}: {
  params: Promise<{ prefecture: string; city: string }>;
}) {
  const supabase = await createClient();
  const { prefecture, city } = await params;
  const decodedCity = decodeURIComponent(city);

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PosterPrefectureKey)) {
    return redirect("/map/poster");
  }

  const prefectureKey = prefecture as PosterPrefectureKey;
  const { jp: prefectureNameJp, center: prefectureCenter } =
    POSTER_PREFECTURE_MAP[prefectureKey];

  // Get boards for this city
  const boards = await getPosterBoardsByCity(prefectureNameJp, decodedCity);

  if (boards.length === 0) {
    return redirect(`/map/poster/${prefecture}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Calculate center from boards or use prefecture center
  let center = prefectureCenter;
  let zoom = 13;

  const lats = boards
    .map((b) => b.lat)
    .filter((lat): lat is number => lat !== null);
  const lngs = boards
    .map((b) => b.long)
    .filter((lng): lng is number => lng !== null);

  if (lats.length > 0 && lngs.length > 0) {
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    center = [avgLat, avgLng];

    // Calculate appropriate zoom level based on spread
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread > 0.1) zoom = 12;
    else if (maxSpread > 0.05) zoom = 13;
    else if (maxSpread > 0.02) zoom = 14;
    else zoom = 15;
  }

  const doneCount = boards.filter((b) => b.status === "done").length;
  const progress = boards.length > 0 ? (doneCount / boards.length) * 100 : 0;

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="px-4 md:px-6 py-4 space-y-2">
        <h1 className="text-3xl font-bold">
          {prefectureNameJp} - {decodedCity}
        </h1>
        <p className="text-muted-foreground">
          ポスター掲示板の配置状況と進捗を確認できます
        </p>
        <div className="flex items-center gap-4 text-sm">
          <span>掲示板数: {boards.length}</span>
          <span>完了: {doneCount}</span>
          <span>進捗: {progress.toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex-1 relative">
        <CityPosterMapClient
          boards={boards}
          center={center}
          zoom={zoom}
          userId={user?.id}
        />
      </div>

      <div className="flex flex-wrap gap-4 px-4 py-4 text-sm bg-background border-t">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-500" />
          <span>未着手</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span>予約済み</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span>完了</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>エラー</span>
        </div>
      </div>
    </div>
  );
}
