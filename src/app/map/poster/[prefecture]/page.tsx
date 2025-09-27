import { getUserEditedBoardIdsAction } from "@/features/map-poster/actions/poster-boards";
import PrefecturePosterMapClient from "@/features/map-poster/components/prefecture-poster-map-client";
import {
  POSTER_PREFECTURE_MAP,
  type PosterPrefectureKey,
} from "@/features/map-poster/constants/poster-prefectures";
import {
  getPosterBoardStats,
  getPosterBoardTotalByPrefecture,
} from "@/features/map-poster/services/poster-boards";
import { getUser } from "@/lib/services/user";
import type { Metadata } from "next";
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

const validPrefectures = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];

export default async function PrefecturePosterMapPage({
  params,
}: {
  params: Promise<{ prefecture: string }>;
}) {
  const { prefecture } = await params;

  const user = await getUser();

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PosterPrefectureKey)) {
    return redirect("/map/poster");
  }

  const prefectureKey = prefecture as PosterPrefectureKey;
  const { jp: prefectureNameJp, center } = POSTER_PREFECTURE_MAP[prefectureKey];

  // 統計情報を取得
  const stats = await getPosterBoardStats(
    prefectureNameJp as Parameters<typeof getPosterBoardStats>[0],
  );

  // 選管データから実際の掲示板総数を取得
  const boardTotal = await getPosterBoardTotalByPrefecture(prefectureNameJp);

  // ユーザーが最後に編集した掲示板IDを取得
  let userEditedBoardIds: string[] = [];
  if (user?.id) {
    userEditedBoardIds = await getUserEditedBoardIdsAction(
      prefectureNameJp as Parameters<typeof getUserEditedBoardIdsAction>[0],
      user.id,
    );
  }

  return (
    <PrefecturePosterMapClient
      userId={user?.id}
      prefecture={prefectureNameJp}
      prefectureName={prefectureNameJp}
      center={center}
      initialStats={stats}
      boardTotal={boardTotal}
      userEditedBoardIds={userEditedBoardIds}
    />
  );
}
