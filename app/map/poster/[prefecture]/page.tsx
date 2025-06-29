import {
  POSTER_PREFECTURE_MAP,
  type PosterPrefectureKey,
} from "@/lib/constants/poster-prefectures";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PrefecturePosterMapClient from "./PrefecturePosterMapClient";

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

const validPrefectures = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];

export default async function PrefecturePosterMapPage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const supabase = await createClient();
  const { prefecture } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PosterPrefectureKey)) {
    return redirect("/map/poster");
  }

  const prefectureKey = prefecture as PosterPrefectureKey;
  const { jp: prefectureNameJp, center } = POSTER_PREFECTURE_MAP[prefectureKey];

  return (
    <PrefecturePosterMapClient
      userId={user.id}
      prefecture={prefectureNameJp}
      prefectureName={prefectureNameJp}
      center={center}
    />
  );
}
