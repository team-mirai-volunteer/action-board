import { CurrentUserCardMission } from "@/components/ranking/current-user-card-mission";
import { MissionSelect } from "@/components/ranking/mission-select";
import RankingMission from "@/components/ranking/ranking-mission";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { getUserMissionRanking } from "@/lib/services/missionsRanking";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{
    missionId?: string;
  }>;
}

export default async function RankingMissionPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;

  // ユーザー情報取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // ミッション一覧を取得（max_achievement_countがnullのもののみ）
  const { data: missions, error: missionsError } = await supabase
    .from("missions")
    .select("*")
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
    // 現在のユーザーのミッション別ランキングを探す
    userRanking = await getUserMissionRanking(selectedMission.id, user.id);
  }

  return (
    <div className="flex flex-col min-h-screen py-4 w-full">
      <RankingTabs>
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
            />
          </section>
        )}

        <section className="py-4 bg-white">
          {/* ミッション別ランキング */}
          <RankingMission limit={100} mission={selectedMission} />
        </section>
      </RankingTabs>
    </div>
  );
}
