import { CurrentUserCard } from "@/features/ranking/components/current-user-card";
import {
  PeriodToggle,
  type RankingPeriod,
} from "@/features/ranking/components/period-toggle";
import { RankingTabs } from "@/features/ranking/components/ranking-tabs";
import { RankingTop } from "@/features/ranking/components/ranking-top";
import { getUserPeriodRanking } from "@/features/ranking/services/get-ranking";
import { getUser } from "@/features/user-profile/services/profile";
import { getCurrentSeasonId } from "@/lib/services/seasons";

interface PageProps {
  searchParams: Promise<{
    period?: RankingPeriod;
  }>;
}

export default async function RankingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "daily";

  // 現在のシーズンIDを取得
  const currentSeasonId = await getCurrentSeasonId();

  // ユーザー情報取得
  const user = await getUser();

  // ユーザーランキング取得
  const userRanking =
    user && currentSeasonId
      ? await getUserPeriodRanking(user.id, currentSeasonId, period)
      : null;

  return (
    <div className="flex flex-col min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-4">
        アクションリーダー
      </h2>
      <RankingTabs>
        {/* 期間選択トグル */}
        <section className="py-4">
          <PeriodToggle defaultPeriod={period} />
        </section>

        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4">
            <CurrentUserCard currentUser={userRanking} />
          </section>
        )}

        <section className="py-4">
          {/* ランキング */}
          <RankingTop limit={100} period={period} />
        </section>
      </RankingTabs>
    </div>
  );
}
