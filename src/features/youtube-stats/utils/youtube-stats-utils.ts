import type {
  OverallStatsHistoryItem,
  SortType,
  VideoCountByDateItem,
  YouTubeVideoWithStats,
} from "../types";

/**
 * 動画統計の生データ型（Supabaseリレーションから取得）
 */
export interface RawVideoStats {
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  recorded_at: string;
}

/**
 * 動画と統計リレーションの生データ型
 */
export interface VideoWithStatsRelation {
  youtube_video_stats: RawVideoStats[];
  [key: string]: unknown;
}

/**
 * 動画配列から最新統計を抽出し、YouTubeVideoWithStats形式にマッピングする
 */
export function extractLatestStats(
  videos: VideoWithStatsRelation[],
): YouTubeVideoWithStats[] {
  return videos.map((video) => {
    const stats = video.youtube_video_stats;

    // 最新の統計を取得（recorded_atでソート）
    const latestStats = [...stats].sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    )[0];

    return {
      ...video,
      youtube_video_stats: undefined,
      latest_view_count: latestStats?.view_count ?? null,
      latest_like_count: latestStats?.like_count ?? null,
      latest_comment_count: latestStats?.comment_count ?? null,
    } as unknown as YouTubeVideoWithStats;
  });
}

/**
 * 動画リストを指定メトリクスでソートする
 */
export function sortVideosByMetric(
  videos: YouTubeVideoWithStats[],
  sortBy: SortType,
): YouTubeVideoWithStats[] {
  return [...videos].sort((a, b) => {
    switch (sortBy) {
      case "view_count":
        return (b.latest_view_count ?? 0) - (a.latest_view_count ?? 0);
      case "like_count":
        return (b.latest_like_count ?? 0) - (a.latest_like_count ?? 0);
      default:
        return (
          new Date(b.published_at ?? 0).getTime() -
          new Date(a.published_at ?? 0).getTime()
        );
    }
  });
}

/**
 * youtube_video_statsデータを日別に集計する
 */
export function aggregateDailyStats(
  data: {
    recorded_at: string;
    view_count: number | null;
    like_count: number | null;
  }[],
): Map<string, { total_views: number; total_likes: number }> {
  const dailyStats = new Map<
    string,
    { total_views: number; total_likes: number }
  >();

  for (const stat of data) {
    const date = stat.recorded_at;
    const current = dailyStats.get(date) || { total_views: 0, total_likes: 0 };
    dailyStats.set(date, {
      total_views: current.total_views + (stat.view_count ?? 0),
      total_likes: current.total_likes + (stat.like_count ?? 0),
    });
  }

  return dailyStats;
}

/**
 * Map→配列変換し、日付昇順ソートする
 */
export function mapStatisticsResult(
  map: Map<string, { total_views: number; total_likes: number }>,
): OverallStatsHistoryItem[] {
  return Array.from(map.entries())
    .map(([date, stats]) => ({
      date,
      total_views: stats.total_views,
      total_likes: stats.total_likes,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * published_atで日別ビデオカウントを集計する
 */
export function aggregateVideosByDate(
  videos: { published_at: string | null }[],
): Map<string, number> {
  const dailyCount = new Map<string, number>();

  for (const video of videos) {
    if (!video.published_at) continue;
    const date = video.published_at.split("T")[0];
    dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
  }

  return dailyCount;
}

/**
 * 日付範囲を生成し、各日の投稿数を含める（投稿0の日も含む）
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  dailyCounts: Map<string, number>,
): VideoCountByDateItem[] {
  const result: VideoCountByDateItem[] = [];
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const currentDate = new Date(startDate);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: dailyCounts.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}
