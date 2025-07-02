import {
  POSTER_PREFECTURE_MAP,
  type PosterPrefectureKey,
} from "@/lib/constants/poster-prefectures";
import { getCitiesWithBoardCounts } from "@/lib/services/poster-boards";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const prefectureKey = prefecture as PosterPrefectureKey;
  const prefectureData = POSTER_PREFECTURE_MAP[prefectureKey];
  const prefectureName = prefectureData?.jp || prefecture;
  return {
    title: `${prefectureName}のポスター掲示板マップ`,
    description: `${prefectureName}のポスター掲示板の配置状況を確認できます`,
  };
}

export async function generateStaticParams() {
  return Object.keys(POSTER_PREFECTURE_MAP).map((prefecture) => ({
    prefecture,
  }));
}

const validPrefectures = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];

export default async function PrefecturePosterMapPage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PosterPrefectureKey)) {
    return redirect("/map/poster");
  }

  const prefectureKey = prefecture as PosterPrefectureKey;
  const { jp: prefectureNameJp } = POSTER_PREFECTURE_MAP[prefectureKey];

  // Get cities with board counts
  const citiesData = await getCitiesWithBoardCounts(prefectureNameJp);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold">
          {prefectureNameJp}のポスター掲示板
        </h1>
        <p className="mt-2 text-muted-foreground">
          市区町村を選択してポスター掲示板の詳細を確認できます
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {citiesData.map(({ city, total, done, progress }) => (
          <Link
            key={city}
            href={`/map/poster/${prefecture}/${encodeURIComponent(city)}`}
            className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold group-hover:text-primary">{city}</h3>
              <p className="text-sm text-muted-foreground">掲示板数: {total}</p>

              <div className="mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    完了: {done}/{total}
                  </span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 -bottom-1 h-1 bg-primary opacity-0 transition-opacity group-hover:opacity-100"
              style={{ width: `${progress}%` }}
            />
          </Link>
        ))}
      </div>

      {citiesData.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            この都道府県にはポスター掲示板のデータがありません
          </p>
        </div>
      )}
    </div>
  );
}
