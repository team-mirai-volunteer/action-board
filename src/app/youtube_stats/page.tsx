import { YouTubeOverallChart } from "@/features/youtube-stats/components/youtube-overall-chart";
import { YouTubePeriodFilter } from "@/features/youtube-stats/components/youtube-period-filter";
import { YouTubeSortToggle } from "@/features/youtube-stats/components/youtube-sort-toggle";
import { YouTubeStatsSummary } from "@/features/youtube-stats/components/youtube-stats-summary";
import { YouTubeUploadChart } from "@/features/youtube-stats/components/youtube-upload-chart";
import { YouTubeVideoList } from "@/features/youtube-stats/components/youtube-video-list";
import {
  getOverallStatsHistory,
  getVideoCountByDate,
  getYouTubeStatsSummary,
  getYouTubeVideoCount,
  getYouTubeVideosWithStats,
} from "@/features/youtube-stats/services/youtube-stats-service";
import {
  type PeriodType,
  type SortType,
  getPeriodEndDate,
  getPeriodStartDate,
} from "@/features/youtube-stats/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube動画ダッシュボード | Action Board",
  description:
    "#チームみらい ハッシュタグのYouTube動画一覧と統計情報を表示します。",
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

export default async function YouTubeStatsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const sort = resolvedSearchParams.sort || "published_at";
  const page = Math.max(1, Number(resolvedSearchParams.page) || 1);
  const period = resolvedSearchParams.period || "all";
  const customStartDate = resolvedSearchParams.startDate;
  const customEndDate = resolvedSearchParams.endDate;
  const offset = (page - 1) * PAGE_SIZE;

  // 期間フィルター用の開始日・終了日を取得
  const startDate = getPeriodStartDate(period, customStartDate) || undefined;
  const endDate = getPeriodEndDate(customEndDate) || undefined;

  // データ取得
  const [videos, totalCount, summary, overallStats, uploadStats] =
    await Promise.all([
      getYouTubeVideosWithStats(PAGE_SIZE, offset, sort, startDate, endDate),
      getYouTubeVideoCount(startDate, endDate),
      getYouTubeStatsSummary(startDate, endDate),
      getOverallStatsHistory(startDate, endDate),
      getVideoCountByDate(startDate, endDate),
    ]);

  return (
    <div className="flex flex-col min-h-screen py-4 w-full max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">YouTube動画ダッシュボード</h1>
        <YouTubePeriodFilter
          defaultPeriod={period}
          defaultStartDate={customStartDate}
          defaultEndDate={customEndDate}
        />
      </div>

      {/* サマリー統計 */}
      <section className="mb-6">
        <YouTubeStatsSummary summary={summary} />
      </section>

      {/* グラフセクション */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <YouTubeOverallChart data={overallStats} />
        <YouTubeUploadChart data={uploadStats} />
      </section>

      {/* ソート切替 */}
      <section className="mb-6">
        <YouTubeSortToggle defaultSort={sort} />
      </section>

      {/* 動画リスト */}
      <section>
        <YouTubeVideoList
          videos={videos}
          totalCount={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
        />
      </section>
    </div>
  );
}
