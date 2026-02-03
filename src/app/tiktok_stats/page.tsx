import type { Metadata } from "next";
import { TikTokOverallChart } from "@/features/tiktok-stats/components/tiktok-overall-chart";
import { TikTokPeriodFilter } from "@/features/tiktok-stats/components/tiktok-period-filter";
import { TikTokSortToggle } from "@/features/tiktok-stats/components/tiktok-sort-toggle";
import { TikTokStatsSummary } from "@/features/tiktok-stats/components/tiktok-stats-summary";
import { TikTokUploadChart } from "@/features/tiktok-stats/components/tiktok-upload-chart";
import { TikTokVideoList } from "@/features/tiktok-stats/components/tiktok-video-list";
import {
  getOverallStatsHistory,
  getTikTokStatsSummary,
  getTikTokVideoCount,
  getTikTokVideosWithStats,
  getVideoCountByDate,
} from "@/features/tiktok-stats/services/tiktok-stats-service";
import {
  getPeriodEndDate,
  getPeriodStartDate,
  type PeriodType,
  type SortType,
} from "@/features/tiktok-stats/types";

export const metadata: Metadata = {
  title: "TikTok動画ダッシュボード | Action Board",
  description:
    "#チームみらい ハッシュタグのTikTok動画一覧と統計情報を表示します。",
};

const PAGE_SIZE = 40;

interface PageProps {
  searchParams: Promise<{
    sort?: SortType;
    page?: string;
    period?: PeriodType;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function TikTokStatsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort || "published_at";
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const period = resolvedSearchParams.period || "this_year";
  const customStartDate = resolvedSearchParams.startDate;
  const customEndDate = resolvedSearchParams.endDate;
  const offset = (page - 1) * PAGE_SIZE;

  const startDate = getPeriodStartDate(period, customStartDate) || undefined;
  const endDate = getPeriodEndDate(customEndDate) || undefined;

  const [videos, totalCount, summary, overallStats, uploadStats] =
    await Promise.all([
      getTikTokVideosWithStats(PAGE_SIZE, offset, sort, startDate, endDate),
      getTikTokVideoCount(startDate, endDate),
      getTikTokStatsSummary(startDate, endDate),
      getOverallStatsHistory(startDate, endDate),
      getVideoCountByDate(startDate, endDate),
    ]);

  return (
    <div className="flex flex-col min-h-screen py-4 w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">TikTok動画ダッシュボード</h1>
        <TikTokPeriodFilter
          defaultPeriod={period}
          defaultStartDate={customStartDate}
          defaultEndDate={customEndDate}
        />
      </div>

      {/* サマリー統計 */}
      <section className="mb-6">
        <TikTokStatsSummary summary={summary} />
      </section>

      {/* グラフセクション */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TikTokOverallChart data={overallStats} />
        <TikTokUploadChart data={uploadStats} />
      </section>

      {/* ソート切替 */}
      <section className="mb-6">
        <TikTokSortToggle defaultSort={sort} />
      </section>

      {/* 動画リスト */}
      <section>
        <TikTokVideoList
          videos={videos}
          totalCount={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
        />
      </section>
    </div>
  );
}
