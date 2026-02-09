import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/common/page-breadcrumb";
import { getMissionsForRanking } from "@/features/missions/services/missions";
import { CurrentUserCardMission } from "@/features/ranking/components/current-user-card-mission";
import { MissionSelect } from "@/features/ranking/components/mission-select";
import { RankingMission } from "@/features/ranking/components/ranking-mission";
import { RankingTabs } from "@/features/ranking/components/ranking-tabs";
import { SeasonRankingHeader } from "@/features/ranking/components/season-ranking-header";
import {
  getUserMissionRanking,
  getUserPostingCountByMission,
} from "@/features/ranking/services/get-missions-ranking";
import { getUser } from "@/features/user-profile/services/profile";
import { getSeasonBySlug } from "@/lib/services/seasons";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    missionId?: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const season = await getSeasonBySlug(slug);

  if (!season) {
    return {
      title: "Season Not Found - Action Board",
    };
  }

  return {
    title: `${season.name} ミッション別ランキング - アクションボード`,
  };
}

export default async function SeasonMissionRankingPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const season = await getSeasonBySlug(slug);

  if (!season) {
    notFound();
  }

  // ユーザー情報取得
  const user = await getUser();

  // ミッション一覧を取得
  const missions = await getMissionsForRanking();

  if (missions.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        現在利用可能なミッションがありません。
      </div>
    );
  }

  // 選択されたミッションまたは最初のミッション（is_featured優先）を取得
  const selectedMission = resolvedSearchParams.missionId
    ? missions.find((m) => m.id === resolvedSearchParams.missionId)
    : missions[0]; // is_featuredがtrueのものが先頭に来ているため、最初のものを選択

  if (!selectedMission) {
    return (
      <div className="p-4 text-gray-600">
        選択されたミッションが見つかりません。
      </div>
    );
  }

  let userRanking = null;

  if (user) {
    // 現在のユーザーのミッション別ランキングを探す（シーズン対応）
    userRanking = await getUserMissionRanking(
      selectedMission.id,
      user.id,
      season.id,
    );
  }

  // ミッションタイプに応じてbadgeTextを生成、ポスティングミッションの場合はポスティング枚数を取得
  const isPostingMission = selectedMission.required_artifact_type === "POSTING";
  const userPostingCount =
    user && isPostingMission
      ? await getUserPostingCountByMission(
          user.id,
          selectedMission.id,
          season.id,
        )
      : 0;
  let badgeText = "";

  if (userRanking) {
    if (isPostingMission) {
      badgeText = `${userPostingCount.toLocaleString()}枚`;
    } else {
      badgeText = `${(userRanking.user_achievement_count ?? 0).toLocaleString()}回`;
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pb-4 w-full">
      <div className="w-full max-w-7xl px-4 mb-4">
        <PageBreadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: season.name },
            { label: "ランキング", href: `/seasons/${slug}/ranking` },
            { label: "ミッション別" },
          ]}
        />
      </div>

      <h2 className="text-2xl font-bold text-center mb-4">
        ミッション別ランキング
      </h2>

      {/* シーズン情報ヘッダー */}
      <SeasonRankingHeader
        season={season}
        currentRankingPath="/ranking/ranking-mission"
      />

      <RankingTabs seasonSlug={season.slug}>
        {/* ミッション選択 */}
        <section className="py-4">
          <MissionSelect missions={missions} />
        </section>

        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4">
            <CurrentUserCardMission
              currentUser={userRanking}
              mission={selectedMission}
              badgeText={badgeText}
            />
          </section>
        )}

        <section className="py-4">
          {/* ミッション別ランキング（シーズン対応） */}
          <RankingMission
            limit={100}
            mission={selectedMission}
            isPostingMission={isPostingMission}
            seasonId={season.id}
          />
        </section>
      </RankingTabs>
    </div>
  );
}
