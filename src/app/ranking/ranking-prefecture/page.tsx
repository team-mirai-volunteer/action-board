import { CurrentUserCardPrefecture } from "@/components/ranking/current-user-card-prefecture";
import {
  PeriodToggle,
  type RankingPeriod,
} from "@/components/ranking/period-toggle";
import { PrefectureSelect } from "@/components/ranking/prefecture-select";
import RankingPrefecture from "@/components/ranking/ranking-prefecture";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { PREFECTURES } from "@/lib/address";
import { getUserPrefecturesRanking } from "@/lib/services/prefecturesRanking";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { getMyProfile } from "@/lib/services/users";
import { createClient } from "@/lib/supabase/client";

interface PageProps {
  searchParams: Promise<{
    prefecture?: string;
    period?: RankingPeriod;
  }>;
}

export default async function RankingPrefecturePage({
  searchParams,
}: PageProps) {
  const supabase = createClient();
  const resolvedSearchParams = await searchParams;

  // 現在のシーズンIDを取得
  const currentSeasonId = await getCurrentSeasonId();

  if (!currentSeasonId) {
    return <div className="p-4">現在のシーズンが見つかりません。</div>;
  }

  // ユーザー情報取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // 都道府県一覧を取得
  const prefectures = PREFECTURES;

  // ユーザーのプロフィール情報を取得
  let userProfile = null;
  if (user) {
    userProfile = await getMyProfile();
  }

  // 選択された都道府県を取得（URLパラメータをデコード）
  const decodedPrefecture = resolvedSearchParams.prefecture
    ? decodeURIComponent(resolvedSearchParams.prefecture)
    : null;

  const selectedPrefecture = decodedPrefecture
    ? prefectures.find((p) => p === decodedPrefecture)
    : userProfile?.address_prefecture || prefectures[0];

  if (!selectedPrefecture) {
    return <div className="p-4">選択された都道府県が見つかりません。</div>;
  }

  let userRanking = null;

  if (user) {
    // 現在のユーザーの都道府県別ランキングを探す（シーズン対応）
    userRanking = await getUserPrefecturesRanking(
      selectedPrefecture,
      user.id,
      currentSeasonId,
    );
  }

  return (
    <div className="flex flex-col min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-4">
        アクションリーダー
      </h2>
      <RankingTabs>
        {/* 都道府県選択 */}
        <section className="py-4 bg-white">
          <PrefectureSelect
            prefectures={prefectures}
            selectedPrefecture={selectedPrefecture}
          />
        </section>

        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4 bg-white">
            <CurrentUserCardPrefecture
              currentUser={userRanking}
              prefecture={selectedPrefecture}
            />
          </section>
        )}

        <section className="py-4 bg-white">
          {/* 都道府県別ランキング（シーズン対応） */}
          <RankingPrefecture
            limit={100}
            prefecture={selectedPrefecture}
            seasonId={currentSeasonId}
          />
        </section>
      </RankingTabs>
    </div>
  );
}
