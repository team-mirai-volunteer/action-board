import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/common/page-breadcrumb";
import DetailedPosterMapClient from "@/features/map-poster/components/detailed-poster-map-client";
import {
  POSTER_PREFECTURE_MAP,
  type PosterPrefectureKey,
} from "@/features/map-poster/constants/poster-prefectures";
import { getArchivedPosterBoardStats } from "@/features/map-poster/services/poster-boards";

// Election term display names
const ELECTION_TERM_NAMES: Record<string, string> = {
  "sangin-2025": "参議院選挙 2025",
  "shugin-2026": "衆議院選挙 2026",
};

function isValidPrefecture(key: string): key is PosterPrefectureKey {
  return key in POSTER_PREFECTURE_MAP;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ electionTerm: string; prefecture: string }>;
}): Promise<Metadata> {
  const { electionTerm, prefecture } = await params;

  const termName = ELECTION_TERM_NAMES[electionTerm] || electionTerm;

  if (isValidPrefecture(prefecture)) {
    const prefectureData = POSTER_PREFECTURE_MAP[prefecture];
    return {
      title: `${prefectureData.jp} - ${termName} アーカイブ`,
      description: `${prefectureData.jp}のポスター掲示板の配置状況（${termName} アーカイブ）`,
    };
  }

  return {
    title: `${termName} - ポスター掲示板マップ アーカイブ`,
    description: "ポスター掲示板の配置状況（アーカイブ）",
  };
}

export default async function ArchivePrefecturePage({
  params,
}: {
  params: Promise<{ electionTerm: string; prefecture: string }>;
}) {
  const { electionTerm, prefecture: prefectureKey } = await params;

  // Validate election term
  const termName = ELECTION_TERM_NAMES[electionTerm];
  if (!termName) {
    return notFound();
  }

  // Validate prefecture
  if (!isValidPrefecture(prefectureKey)) {
    return notFound();
  }

  const prefectureData = POSTER_PREFECTURE_MAP[prefectureKey];
  const prefectureJp = prefectureData.jp;

  // Get archived stats for this election term and prefecture
  const stats = await getArchivedPosterBoardStats(electionTerm, prefectureJp);

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 pt-4">
        <PageBreadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "ポスター掲示板マップ", href: "/map/poster" },
            {
              label: termName,
              href: `/map/poster/archive/${electionTerm}`,
            },
            { label: prefectureJp },
          ]}
        />
      </div>
      <DetailedPosterMapClient
        userId={undefined}
        prefecture={prefectureJp}
        prefectureName={prefectureJp}
        center={prefectureData.center}
        initialStats={stats}
        boardTotal={null}
        userEditedBoardIds={[]}
        defaultZoom={prefectureData.defaultZoom}
        isDistrict={false}
        isArchive={true}
        archiveElectionTerm={electionTerm}
        archiveTermName={termName}
      />
    </>
  );
}
