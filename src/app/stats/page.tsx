import {
  ActionStatsChart,
  ActionStatsPeriodFilter,
  ActionStatsSummary,
  MissionRankingList,
} from "@/features/action-stats/components";
import {
  getActionStatsSummary,
  getDailyActionStats,
  getMissionActionRanking,
} from "@/features/action-stats/services/action-stats-service";
import {
  type PeriodType,
  getPeriodEndDate,
  getPeriodStartDate,
} from "@/features/action-stats/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "アクション数ダッシュボード | Action Board",
  description: "アクション数の統計情報を表示します。",
};

interface PageProps {
  searchParams: Promise<{
    period?: PeriodType;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function StatsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "this_year";
  const customStartDate = resolvedSearchParams.startDate;
  const customEndDate = resolvedSearchParams.endDate;

  // 期間フィルター用の開始日・終了日を取得
  const startDate = getPeriodStartDate(period, customStartDate) || undefined;
  const endDate = getPeriodEndDate(customEndDate) || undefined;

  // データ取得
  const [summary, dailyStats, missionRanking] = await Promise.all([
    getActionStatsSummary(startDate, endDate),
    getDailyActionStats(startDate, endDate),
    getMissionActionRanking(startDate, endDate),
  ]);

  return (
    <div className="flex flex-col min-h-screen py-4 w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">アクション数ダッシュボード</h1>
        <ActionStatsPeriodFilter
          defaultPeriod={period}
          defaultStartDate={customStartDate}
          defaultEndDate={customEndDate}
        />
      </div>

      {/* サマリー統計 */}
      <section className="mb-6">
        <ActionStatsSummary summary={summary} />
      </section>

      {/* グラフとランキング */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionStatsChart data={dailyStats} />
        <MissionRankingList rankings={missionRanking} />
      </section>
    </div>
  );
}
