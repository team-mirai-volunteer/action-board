import { Separator } from "@/components/ui/separator";
import { fetchAllMetricsData } from "@/features/metrics/services/get-metrics";
import type { MetricsData } from "@/features/metrics/types/metrics-types";
import { getYouTubeStatsSummary } from "@/features/youtube-stats/services/youtube-stats-service";
import { formatUpdateTime } from "@/lib/utils/metrics-formatter";
import { MetricsLayout } from "./metrics-layout";
import { SupporterMetric } from "./supporter-metric";
import { YouTubeMetric } from "./youtube-metric";

export { MetricsErrorBoundary } from "./metrics-error-boundary";
export { MetricsWithSuspense } from "./metrics-with-suspense";

/**
 * メトリクス表示コンポーネント
 *
 * チームみらいの活動状況を表示するメインコンポーネント
 * 以下のデータを統合して表示：
 * 1. サポーター数（外部API）
 * 2. YouTube動画再生数（Supabase）
 */
export async function Metrics() {
  let metricsData: MetricsData;
  try {
    metricsData = await fetchAllMetricsData();
  } catch (error) {
    console.error("Failed to fetch metrics data:", error);
    metricsData = {
      supporter: null,
      achievement: null,
      registration: null,
    };
  }

  // YouTube統計を取得
  let youtubeStats = {
    totalVideos: 0,
    totalViews: 0,
    dailyViewsIncrease: 0,
    dailyVideosIncrease: 0,
  };
  try {
    const stats = await getYouTubeStatsSummary();
    youtubeStats = {
      totalVideos: stats.totalVideos,
      totalViews: stats.totalViews,
      dailyViewsIncrease: stats.dailyViewsIncrease ?? 0,
      dailyVideosIncrease: stats.dailyVideosIncrease ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch YouTube stats:", error);
  }

  const fallbackSupporterCount =
    Number(process.env.FALLBACK_SUPPORTER_COUNT) || 0;
  const fallbackSupporterIncrease =
    Number(process.env.FALLBACK_SUPPORTER_INCREASE) || 0;

  const lastUpdated = metricsData.supporter?.updatedAt
    ? formatUpdateTime(metricsData.supporter.updatedAt)
    : process.env.FALLBACK_UPDATE_DATE || "2025.07.03 02:20";

  return (
    <MetricsLayout title="チームみらいの活動状況🚀" lastUpdated={lastUpdated}>
      {/* サポーター数 */}
      <SupporterMetric
        data={metricsData.supporter}
        fallbackCount={fallbackSupporterCount}
        fallbackIncrease={fallbackSupporterIncrease}
      />

      {/* 水平セパレーター */}
      <Separator orientation="horizontal" className="my-4" />

      {/* YouTube統計 */}
      <YouTubeMetric
        totalViews={youtubeStats.totalViews}
        totalVideos={youtubeStats.totalVideos}
        dailyViewsIncrease={youtubeStats.dailyViewsIncrease}
        dailyVideosIncrease={youtubeStats.dailyVideosIncrease}
      />
    </MetricsLayout>
  );
}
