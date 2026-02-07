import { getMissionsForRanking } from "@/features/missions/services/missions";
import { CurrentUserCardMission } from "@/features/ranking/components/current-user-card-mission";
import { MissionSelect } from "@/features/ranking/components/mission-select";
import type { RankingPeriod } from "@/features/ranking/components/period-toggle";
import { RankingMission } from "@/features/ranking/components/ranking-mission";
import { RankingTabs } from "@/features/ranking/components/ranking-tabs";
import {
  getUserMissionRanking,
  getUserPostingCountByMission,
} from "@/features/ranking/loaders/ranking-loaders";
import { getCurrentSeasonId } from "@/lib/loaders/seasons-loaders";

interface PageProps {
  searchParams: Promise<{
    missionId?: string;
    period?: RankingPeriod;
  }>;
}

export default async function RankingMissionPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;

  // 現在のシーズンIDを取得
  const currentSeasonId = await getCurrentSeasonId();

  if (!currentSeasonId) {
    return <div className="p-4">現在のシーズンが見つかりません。</div>;
  }

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

  // 現在のユーザーのミッション別ランキングを探す（シーズン対応）
  const userRanking = await getUserMissionRanking(
    selectedMission.id,
    currentSeasonId,
  );

  // ミッションタイプに応じてbadgeTextを生成、ポスティングミッションの場合はポスティング枚数を取得
  const isPostingMission = selectedMission.required_artifact_type === "POSTING";
  const userPostingCount = isPostingMission
    ? await getUserPostingCountByMission(selectedMission.id, currentSeasonId)
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
    <div className="flex flex-col min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-4">
        アクションリーダー
      </h2>
      <RankingTabs>
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
            seasonId={currentSeasonId}
          />
        </section>
      </RankingTabs>
    </div>
  );
}
