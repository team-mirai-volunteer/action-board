import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import { getJstRecentDates, toJstDateString } from "@/lib/utils/date-utils";
import {
  calculateDailyViewsIncrease,
  type VideoStatsRecord,
} from "@/lib/utils/stats-calculator";
import type {
  OverallStatsHistoryItem,
  SortType,
  StatsSummary,
  VideoCountByDateItem,
  YouTubeVideoWithStats,
} from "../types";
import {
  aggregateDailyStats,
  aggregateVideosByDate,
  extractLatestStats,
  generateDateRange,
  mapStatisticsResult,
  sortVideosByMetric,
} from "../utils/youtube-stats-utils";

/**
 * YouTube動画一覧を最新統計付きで取得する
 * @param limit - 取得件数
 * @param offset - オフセット
 * @param sortBy - ソート順
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 動画一覧
 */
export async function getYouTubeVideosWithStats(
  limit: number,
  offset: number,
  sortBy: SortType,
  startDate?: Date,
  endDate?: Date,
): Promise<YouTubeVideoWithStats[]> {
  const supabase = await createAdminClient();

  // 動画と最新の統計情報を取得
  let query = supabase
    .from("youtube_videos")
    .select(
      `
      *,
      youtube_video_stats(
        view_count,
        like_count,
        comment_count,
        recorded_at
      )
    `,
    )
    .eq("is_active", true);

  if (startDate) {
    query = query.gte("published_at", startDate.toISOString());
  }
  if (endDate) {
    // 終了日は翌日の0時までを含める
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("published_at", endOfDay.toISOString());
  }

  const { data: videos, error } = await query.order("published_at", {
    ascending: false,
  });

  if (error) {
    console.error("Failed to fetch YouTube videos:", error);
    return [];
  }

  // 各動画の最新統計を取得して整形
  const videosWithStats = extractLatestStats(
    (videos || []) as Parameters<typeof extractLatestStats>[0],
  );

  // ソート
  const sorted = sortVideosByMetric(videosWithStats, sortBy);

  // ページネーション
  return sorted.slice(offset, offset + limit);
}

/**
 * YouTube動画の総数を取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 総動画数
 */
export async function getYouTubeVideoCount(
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const supabase = await createAdminClient();

  let query = supabase
    .from("youtube_videos")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (startDate) {
    query = query.gte("published_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("published_at", endOfDay.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    console.error("Failed to fetch YouTube video count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * YouTube動画のサマリー統計を取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns サマリー統計
 */
export async function getYouTubeStatsSummary(
  startDate?: Date,
  endDate?: Date,
): Promise<StatsSummary> {
  const supabase = await createAdminClient();

  // 全動画を取得して最新統計をカウント
  let query = supabase
    .from("youtube_videos")
    .select(
      `
      video_id,
      published_at,
      youtube_video_stats(
        view_count,
        like_count,
        comment_count,
        recorded_at
      )
    `,
    )
    .eq("is_active", true);

  if (startDate) {
    query = query.gte("published_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("published_at", endOfDay.toISOString());
  }

  const { data: videos, error } = await query;

  if (error) {
    console.error("Failed to fetch YouTube stats summary:", error);
    return {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };
  }

  let totalLikes = 0;
  let totalComments = 0;
  let recentVideosCount = 0;

  // JSTで日付を取得
  const { today, yesterday, dayBeforeYesterday } = getJstRecentDates();

  // 今日投稿された動画があるかを先にチェック
  let hasTodayVideos = false;
  for (const video of videos || []) {
    const publishedAt = video.published_at as string | null;
    if (publishedAt && toJstDateString(new Date(publishedAt)) === today) {
      hasTodayVideos = true;
      break;
    }
  }

  // 各動画の統計データを収集
  const allVideoStats: VideoStatsRecord[][] = [];

  for (const video of videos || []) {
    // 今日投稿された動画をカウント（今日のデータがなければ昨日もカウント）
    const publishedAt = video.published_at as string | null;
    const publishedDateJst = publishedAt
      ? toJstDateString(new Date(publishedAt))
      : null;
    if (
      publishedDateJst === today ||
      (!hasTodayVideos && publishedDateJst === yesterday)
    ) {
      recentVideosCount++;
    }

    const stats = video.youtube_video_stats as Array<{
      view_count: number | null;
      like_count: number | null;
      comment_count: number | null;
      recorded_at: string;
    }>;

    // recorded_atでソート（新しい順）
    const sortedStats = stats.sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    );

    // 最新の統計を取得してlikes/commentsを集計
    const latestStats = sortedStats[0];
    if (latestStats) {
      totalLikes += latestStats.like_count ?? 0;
      totalComments += latestStats.comment_count ?? 0;
    }

    // 日次増加計算用にrecorded_atをJST日付文字列に変換
    const videoStatsRecords: VideoStatsRecord[] = sortedStats.map((s) => ({
      recorded_at: toJstDateString(new Date(s.recorded_at)),
      view_count: s.view_count,
    }));
    allVideoStats.push(videoStatsRecords);
  }

  // 日次増加数を計算
  const { totalViews, dailyViewsIncrease } = calculateDailyViewsIncrease(
    allVideoStats,
    today,
    yesterday,
    dayBeforeYesterday,
  );

  return {
    totalVideos: videos?.length ?? 0,
    totalViews,
    totalLikes,
    totalComments,
    dailyViewsIncrease,
    dailyVideosIncrease: recentVideosCount,
  };
}

/**
 * 全体の日別統計推移を取得する（期間内に公開された動画のみ）
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 日別の合計統計
 */
export async function getOverallStatsHistory(
  startDate?: Date,
  endDate?: Date,
): Promise<OverallStatsHistoryItem[]> {
  const supabase = await createAdminClient();

  // JOINを使って1つのクエリで取得（URI too long エラーを回避）
  let query = supabase
    .from("youtube_video_stats")
    .select(
      `
      recorded_at,
      view_count,
      like_count,
      youtube_videos!inner(
        published_at,
        is_active
      )
    `,
    )
    .eq("youtube_videos.is_active", true)
    .order("recorded_at", { ascending: true });

  // 動画の公開日でフィルター
  if (startDate) {
    query = query.gte("youtube_videos.published_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("youtube_videos.published_at", endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch overall stats history:", error);
    return [];
  }

  // 日別に集計
  const dailyStats = aggregateDailyStats(data || []);

  // 配列に変換して本日以降のデータを除外
  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  const result = mapStatisticsResult(dailyStats);

  return filterBeforeToday(result);
}

/**
 * 日別の動画投稿数を取得する
 * @param startDate - 開始日（オプション、デフォルトは2026年1月1日）
 * @param endDate - 終了日（オプション、デフォルトは今日）
 * @returns 日別の動画投稿数
 */
export async function getVideoCountByDate(
  startDate?: Date,
  endDate?: Date,
): Promise<VideoCountByDateItem[]> {
  const supabase = await createAdminClient();

  const effectiveStartDate = startDate || new Date("2026-01-01");
  const effectiveEndDate = endDate || new Date();

  let query = supabase
    .from("youtube_videos")
    .select("published_at")
    .eq("is_active", true)
    .order("published_at", { ascending: true });

  query = query.gte("published_at", effectiveStartDate.toISOString());
  const endOfDay = new Date(effectiveEndDate);
  endOfDay.setDate(endOfDay.getDate() + 1);
  query = query.lt("published_at", endOfDay.toISOString());

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch video count by date:", error);
    return [];
  }

  // 日別に集計
  const dailyCount = aggregateVideosByDate(data || []);

  // startDateからendDateまでの日付を生成（投稿0の日も含める）
  const result = generateDateRange(
    effectiveStartDate,
    effectiveEndDate,
    dailyCount,
  );

  // 本日以降のデータを除外
  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  return filterBeforeToday(result);
}
