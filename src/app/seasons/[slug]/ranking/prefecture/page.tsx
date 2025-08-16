import { CurrentUserCardPrefecture } from "@/components/ranking/current-user-card-prefecture";
import { PrefectureSelect } from "@/components/ranking/prefecture-select";
import RankingPrefecture from "@/components/ranking/ranking-prefecture";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { SeasonRankingHeader } from "@/components/season-ranking-header";
import { PREFECTURES } from "@/lib/address";
import { getUserPrefecturesRanking } from "@/lib/services/prefecturesRanking";
import { getSeasonBySlug } from "@/lib/services/seasons";
import { getMyProfile } from "@/lib/services/users";
import { createClient } from "@/lib/supabase/client";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    prefecture?: string;
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
    title: `${season.name} 都道府県別ランキング - アクションボード`,
  };
}

export default async function SeasonPrefectureRankingPage({
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
      season.id,
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-4">
        都道府県別ランキング
      </h2>

      {/* シーズン情報ヘッダー */}
      <SeasonRankingHeader
        season={season}
        currentRankingPath="/ranking/ranking-prefecture"
      />

      <RankingTabs seasonSlug={season.slug}>
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
            seasonId={season.id}
          />
        </section>
      </RankingTabs>
    </div>
  );
}
