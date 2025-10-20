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
import { createClient } from "@/lib/supabase/client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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

  const supabase = createClient();

  // ユーザー情報取得
  const user = await getUser();

  // ミッション一覧をカテゴリ情報付きで取得（max_achievement_countがnullのもののみ）
  const { data: missions, error: missionsError } = await supabase
    .from("missions")
    .select(`
      *,
      mission_category_link(
        mission_category(
          id,
          category_title,
          sort_no
        )
      )
    `)
    .is("max_achievement_count", null)
    .order("is_featured", { ascending: false }) // is_featuredがtrueのものを先頭に
    .order("difficulty", { ascending: true }); // その後、難易度の昇順でソート

  // エラーハンドリング
  if (missionsError) {
    console.error("ミッション取得エラー:", missionsError);
    return (
      <div className="p-4 text-red-600">
        ミッションの取得中にエラーが発生しました。
      </div>
    );
  }

  if (!missions || missions.length === 0) {
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
    <div className="flex flex-col items-center min-h-screen py-4 w-full">
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
        <section className="py-4 bg-white">
          <MissionSelect missions={missions} />
        </section>

        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4 bg-white">
            <CurrentUserCardMission
              currentUser={userRanking}
              mission={selectedMission}
              badgeText={badgeText}
            />
          </section>
        )}

        <section className="py-4 bg-white">
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
