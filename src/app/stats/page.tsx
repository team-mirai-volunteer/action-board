import { ActionPeriodFilter } from "@/features/action-stats/components/action-period-filter";
import { ActionStatsChart } from "@/features/action-stats/components/action-stats-chart";
import { ActionStatsSummary } from "@/features/action-stats/components/action-stats-summary";
import { MissionRankingList } from "@/features/action-stats/components/mission-ranking-list";
import {
  getActionStatsSummary,
  getDailyActionHistory,
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
  description:
    "アクション数の統計情報を表示します。総アクション数、アクティブユーザー数、ミッション別ランキングを確認できます。",
};

interface PageProps {
  searchParams: Promise<{
    period?: PeriodType;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function ActionStatsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period || "this_year";
  const customStartDate = resolvedSearchParams.startDate;
  const customEndDate = resolvedSearchParams.endDate;

  // 期間フィルター用の開始日・終了日を取得
  const startDate = getPeriodStartDate(period, customStartDate) || undefined;
  const endDate = getPeriodEndDate(customEndDate) || undefined;

  // データ取得
  const [summary, dailyHistory, missionRanking] = await Promise.all([
    getActionStatsSummary(startDate, endDate),
    getDailyActionHistory(startDate, endDate),
    getMissionActionRanking(startDate, endDate, 20),
  ]);

  return (
    <div className="flex flex-col min-h-screen py-4 w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">アクション数ダッシュボード</h1>
        <ActionPeriodFilter
          defaultPeriod={period}
          defaultStartDate={customStartDate}
          defaultEndDate={customEndDate}
        />
      </div>

      {/* サマリー統計 */}
      <section className="mb-6">
        <ActionStatsSummary summary={summary} />
      </section>

      {/* グラフセクション */}
      <section className="mb-6">
        <ActionStatsChart data={dailyHistory} />
      </section>

      {/* ミッション別ランキング */}
      <section>
        <MissionRankingList rankings={missionRanking} />
      </section>
    </div>
  );
}
