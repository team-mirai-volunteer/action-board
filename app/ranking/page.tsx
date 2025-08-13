import { RankingTop } from "@/components/ranking";
import { CurrentUserCard } from "@/components/ranking/current-user-card";
import {
  PeriodToggle,
  type RankingPeriod,
} from "@/components/ranking/period-toggle";
import { RankingTabs } from "@/components/ranking/ranking-tabs";
import { getJSTMidnightToday } from "@/lib/dateUtils";
import { getCurrentSeasonId } from "@/lib/services/seasons";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{
    period?: RankingPeriod;
  }>;
}

export default async function RankingPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "daily";

  // 現在のシーズンIDを取得
  const currentSeasonId = await getCurrentSeasonId();

  // ユーザー情報取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRanking = null;

  if (user && currentSeasonId) {
    // 期間別の場合は関数を使用（シーズン対応）
    let dateFilter: Date | null = null;
    if (period === "daily") {
      // 日本時間の今日の0時0分を基準にする
      dateFilter = getJSTMidnightToday();
    }

    const { data } = await supabase.rpc("get_user_period_ranking", {
      target_user_id: user.id,
      start_date: dateFilter?.toISOString() || undefined,
      p_season_id: currentSeasonId,
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
    <div className="flex flex-col min-h-screen py-4 w-full">
      <h2 className="text-2xl font-bold text-center mb-4">
        アクションリーダー
      </h2>
      <RankingTabs>
        {/* 期間選択トグル */}
        <section className="py-4 bg-white">
          <PeriodToggle defaultPeriod={period} />
        </section>

        {/* ユーザーのランキングカード */}
        {userRanking && (
          <section className="py-4 bg-white">
            <CurrentUserCard currentUser={userRanking} />
          </section>
        )}

        <section className="py-4 bg-white">
          {/* ランキング */}
          <RankingTop limit={100} period={period} />
        </section>
      </RankingTabs>
    </div>
  );
}
