import { RankingTop } from "@/components/ranking";
import { CurrentUserCard } from "@/components/ranking/current-user-card";
import {
  PeriodToggle,
  type RankingPeriod,
} from "@/components/ranking/period-toggle";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { SeasonRankingHeader } from "@/components/season-ranking-header";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { getSeasonBySlug } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
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

  const supabase = await createClient();

  // ユーザー情報取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRanking = null;

  if (user) {
    // 期間別の場合は関数を使用（シーズン対応）
    let dateFilter: Date | null = null;
    if (period === "daily") {
      // 日本時間の今日の0時0分を基準にする
      dateFilter = getJSTMidnightToday();
    }

    const { data } = await supabase.rpc("get_user_period_ranking", {
      target_user_id: user.id,
      start_date: dateFilter?.toISOString() || undefined,
      p_season_id: season.id,
    });

    if (data && data.length > 0) {
      userRanking = {
        user_id: data[0].user_id,
        address_prefecture: data[0].address_prefecture,
        level: data[0].level,
        name: data[0].name,
        rank: data[0].rank,
        updated_at: data[0].updated_at,
        xp: data[0].xp,
      };
    }
  }

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
