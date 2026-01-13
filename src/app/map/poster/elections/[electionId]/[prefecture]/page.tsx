import { getElectionById } from "@/features/elections/services/elections";
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
import { getUser } from "@/features/user-profile/services/profile";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ electionId: string; prefecture: string }>;
}): Promise<Metadata> {
  const { electionId, prefecture } = await params;
  const election = await getElectionById(electionId);
  const prefectureKey = prefecture as PosterPrefectureKey;
  const prefectureData = POSTER_PREFECTURE_MAP[prefectureKey];
  const prefectureName = prefectureData?.jp || prefecture;

  if (!election) {
    return {
      title: "選挙が見つかりません",
    };
  }

  return {
    title: `${election.subject} - ${prefectureName}のポスター掲示板マップ`,
    description: `${election.subject}における${prefectureName}のポスター掲示板の配置状況を確認できます`,
  };
}

const validPrefectures = Object.keys(
  POSTER_PREFECTURE_MAP,
) as PosterPrefectureKey[];

export default async function ElectionPrefecturePosterMapPage({
  params,
}: {
  params: Promise<{ electionId: string; prefecture: string }>;
}) {
  const { electionId, prefecture } = await params;

  const election = await getElectionById(electionId);
  if (!election) {
    notFound();
  }

  const user = await getUser();

  // Validate prefecture parameter
  if (!validPrefectures.includes(prefecture as PosterPrefectureKey)) {
    return redirect(`/map/poster/elections/${electionId}`);
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
    <div>
      <div className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="container mx-auto">
          <p className="text-sm text-gray-600">
            {election.subject} (
            {new Date(election.start_date).toLocaleDateString()} -{" "}
            {new Date(election.end_date).toLocaleDateString()})
          </p>
        </div>
      </div>
      <PrefecturePosterMapClient
        userId={user?.id}
        prefecture={prefectureNameJp}
        prefectureName={prefectureNameJp}
        center={center}
        initialStats={stats}
        boardTotal={boardTotal}
        userEditedBoardIds={userEditedBoardIds}
      />
    </div>
  );
}
