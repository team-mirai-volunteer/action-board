import { Separator } from "@/components/ui/separator";
import { fetchAllMetricsData } from "@/features/metrics/services/get-metrics";
import type { MetricsData } from "@/features/metrics/types/metrics-types";
import { getTikTokStatsSummary } from "@/features/tiktok-stats/services/tiktok-stats-service";
import { getYouTubeStatsSummary } from "@/features/youtube-stats/services/youtube-stats-service";
import { formatUpdateTime } from "@/lib/utils/metrics-formatter";
import { MetricsLayout } from "./metrics-layout";
import { SupporterMetric } from "./supporter-metric";
import { VideoMetric } from "./video-metric";

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

  // YouTube + TikTok統計を取得（今年の1月1日以降のデータのみ）
  const thisYear = new Date().getFullYear();
  const startOfYear = new Date(`${thisYear}-01-01`);
  let combinedVideoStats = {
    totalVideos: 0,
    totalViews: 0,
    dailyViewsIncrease: 0,
    dailyVideosIncrease: 0,
  };
  try {
    const [youtubeStats, tiktokStats] = await Promise.all([
      getYouTubeStatsSummary(startOfYear),
      getTikTokStatsSummary(startOfYear),
    ]);
    combinedVideoStats = {
      totalVideos: youtubeStats.totalVideos + tiktokStats.totalVideos,
      totalViews: youtubeStats.totalViews + tiktokStats.totalViews,
      dailyViewsIncrease:
        (youtubeStats.dailyViewsIncrease ?? 0) +
        (tiktokStats.dailyViewsIncrease ?? 0),
      dailyVideosIncrease:
        (youtubeStats.dailyVideosIncrease ?? 0) +
        (tiktokStats.dailyVideosIncrease ?? 0),
    };
  } catch (error) {
    console.error("Failed to fetch video stats:", error);
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

      {/* 動画統計（YouTube + TikTok） */}
      <VideoMetric
        totalViews={combinedVideoStats.totalViews}
        totalVideos={combinedVideoStats.totalVideos}
        dailyViewsIncrease={combinedVideoStats.dailyViewsIncrease}
        dailyVideosIncrease={combinedVideoStats.dailyVideosIncrease}
        startDate={startOfYear}
      />
    </MetricsLayout>
  );
}
