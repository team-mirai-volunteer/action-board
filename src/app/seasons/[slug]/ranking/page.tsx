import { CurrentUserCard } from "@/features/ranking/components/current-user-card";
import {
  PeriodToggle,
  type RankingPeriod,
} from "@/features/ranking/components/period-toggle";
import { RankingTabs } from "@/features/ranking/components/ranking-tabs";
import { RankingTop } from "@/features/ranking/components/ranking-top";
import { SeasonRankingHeader } from "@/features/ranking/components/season-ranking-header";
import { getUserPeriodRanking } from "@/features/ranking/services/get-ranking";
import { getUser } from "@/features/user-profile/services/profile";
import { getSeasonBySlug } from "@/lib/services/seasons";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    period?: RankingPeriod;
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
    title: `${season.name} ランキング - アクションボード`,
  };
}

export default async function SeasonRankingPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "all";

  const season = await getSeasonBySlug(slug);

  if (!season) {
    notFound();
  }

  // ユーザー情報取得
  const user = await getUser();

  // ユーザーランキング取得
  const userRanking = user
    ? await getUserPeriodRanking(user.id, season.id, period)
    : null;

  return (
    <div className="flex flex-col items-center min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-4">
        アクションリーダー
      </h2>

      <SeasonRankingHeader season={season} />

      <RankingTabs seasonSlug={season.slug}>
        {/* 期間選択トグル（過去シーズンでは"all"のみ有効） */}
        <section className="py-4 bg-white">
          {season.is_active && <PeriodToggle defaultPeriod={period} />}
        </section>

        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4 bg-white">
            <CurrentUserCard currentUser={userRanking} />
          </section>
        )}

        <section className="py-4 bg-white">
          {/* ランキング */}
          <RankingTop
            limit={100}
            period={season.is_active ? period : "all"}
            seasonId={season.id}
          />
        </section>
      </RankingTabs>
    </div>
  );
}
