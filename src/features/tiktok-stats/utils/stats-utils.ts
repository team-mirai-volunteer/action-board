import type { TikTokVideoWithStats, VideoCountByDateItem } from "../types";

/**
 * 統計レコードの型（recorded_atでソート可能な共通型）
 */
export interface StatsRecord {
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  recorded_at: string;
}

/**
 * recorded_atでソートして最新の統計レコードを取得する
 */
export function getLatestStats<T extends { recorded_at: string }>(
  stats: T[],
): T | undefined {
  if (stats.length === 0) return undefined;
  return [...stats].sort(
    (a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
  )[0];
}

/**
 * DBレスポンスをTikTokVideoWithStats型にマッピングする
 */
export function mapVideoToWithStats(
  video: Record<string, unknown> & {
    tiktok_video_stats: StatsRecord[];
  },
): TikTokVideoWithStats {
  const stats = video.tiktok_video_stats ?? [];
  const latestStats = getLatestStats(stats);

  return {
    ...video,
    tiktok_video_stats: undefined,
    latest_view_count: latestStats?.view_count ?? null,
    latest_like_count: latestStats?.like_count ?? null,
    latest_comment_count: latestStats?.comment_count ?? null,
    latest_share_count: latestStats?.share_count ?? null,
  } as unknown as TikTokVideoWithStats;
}

/**
 * 統計レコードを日付ごとにグルーピングして合計する
 */
export function aggregateDailyStats(
  data: Array<{
    recorded_at: string;
    view_count: number | null;
    like_count: number | null;
  }>,
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
 * published_at配列から日付ごとの投稿数をカウントする
 */
export function countVideosByDate(
  publishedDates: Array<string | null>,
): Map<string, number> {
  const dailyCount = new Map<string, number>();

  for (const publishedAt of publishedDates) {
    if (!publishedAt) continue;
    const date = publishedAt.split("T")[0];
    dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
  }

  return dailyCount;
}

/**
 * 開始日から終了日までの全日付を生成し、日付ごとのカウントを埋める
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  dailyCount: Map<string, number>,
): VideoCountByDateItem[] {
  const result: VideoCountByDateItem[] = [];
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const currentDate = new Date(startDate);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: dailyCount.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}
