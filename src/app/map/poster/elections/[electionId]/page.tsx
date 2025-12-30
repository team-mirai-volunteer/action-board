import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getElectionById } from "@/features/elections/services/elections";
import PosterMapPageClientOptimized from "@/features/map-poster/components/poster-map-page-client-optimized";
import {
  getPosterBoardSummaryByPrefecture,
  getPosterBoardTotals,
} from "@/features/map-poster/services/poster-boards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ electionId: string }>;
}): Promise<Metadata> {
  const { electionId } = await params;
  const election = await getElectionById(electionId);

  if (!election) {
    return {
      title: "選挙が見つかりません",
    };
  }

  return {
    title: `${election.subject} - ポスター掲示板マップ`,
    description: `${election.subject}のポスター掲示板の配置状況を確認できます`,
  };
}

export default async function ElectionPosterMapPage({
  params,
}: {
  params: Promise<{ electionId: string }>;
}) {
  const { electionId } = await params;
  const election = await getElectionById(electionId);

  if (!election) {
    notFound();
  }

  // サーバーサイドで統計データのみを取得
  const [summary, totals] = await Promise.all([
    getPosterBoardSummaryByPrefecture(),
    getPosterBoardTotals(),
  ]);

  return (
    <div>
      <div className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">{election.subject}</h1>
          <p className="text-sm text-gray-600">
            {new Date(election.start_date).toLocaleDateString()} -{" "}
            {new Date(election.end_date).toLocaleDateString()}
          </p>
        </div>
      </div>
      <PosterMapPageClientOptimized
        initialSummary={summary}
        initialTotals={totals}
      />
    </div>
  );
}
