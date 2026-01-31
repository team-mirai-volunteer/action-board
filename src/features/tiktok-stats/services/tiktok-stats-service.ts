import "server-only";

import { createClient } from "@/lib/supabase/client";
import { getJstRecentDates, toJstDateString } from "@/lib/utils/date-utils";
import {
  type VideoStatsRecord,
  calculateDailyViewsIncrease,
} from "@/lib/utils/stats-calculator";
import type {
  OverallStatsHistoryItem,
  SortType,
  StatsSummary,
  TikTokVideoWithStats,
  VideoCountByDateItem,
} from "../types";

/**
 * TikTok動画一覧を最新統計付きで取得する
 * @param limit - 取得件数
 * @param offset - オフセット
 * @param sortBy - ソート順
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 動画一覧
 */
export async function getTikTokVideosWithStats(
  limit: number,
  offset: number,
  sortBy: SortType,
  startDate?: Date,
  endDate?: Date,
): Promise<TikTokVideoWithStats[]> {
  const supabase = createClient();

  let query = supabase
    .from("tiktok_videos")
    .select(
      `
      *,
      tiktok_video_stats(
        view_count,
        like_count,
        comment_count,
        share_count,
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

  const { data: videos, error } = await query.order("published_at", {
    ascending: false,
  });

  if (error) {
    console.error("Failed to fetch TikTok videos:", error);
    return [];
  }

  const videosWithStats: TikTokVideoWithStats[] = (videos || []).map(
    (video) => {
      const stats = video.tiktok_video_stats as Array<{
        view_count: number | null;
        like_count: number | null;
        comment_count: number | null;
        share_count: number | null;
        recorded_at: string;
      }>;

      const latestStats = stats.sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
      )[0];

      return {
        ...video,
        tiktok_video_stats: undefined,
        latest_view_count: latestStats?.view_count ?? null,
        latest_like_count: latestStats?.like_count ?? null,
        latest_comment_count: latestStats?.comment_count ?? null,
        latest_share_count: latestStats?.share_count ?? null,
      } as TikTokVideoWithStats;
    },
  );

  const sorted = videosWithStats.sort((a, b) => {
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

  return sorted.slice(offset, offset + limit);
}

/**
 * TikTok動画の総数を取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns 総動画数
 */
export async function getTikTokVideoCount(
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const supabase = createClient();

  let query = supabase
    .from("tiktok_videos")
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
    console.error("Failed to fetch TikTok video count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * TikTok動画のサマリー統計を取得する
 * @param startDate - 開始日（オプション）
 * @param endDate - 終了日（オプション）
 * @returns サマリー統計
 */
export async function getTikTokStatsSummary(
  startDate?: Date,
  endDate?: Date,
): Promise<StatsSummary> {
  const supabase = createClient();

  let query = supabase
    .from("tiktok_videos")
    .select(
      `
      id,
      published_at,
      tiktok_video_stats(
        view_count,
        like_count,
        comment_count,
        share_count,
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
    console.error("Failed to fetch TikTok stats summary:", error);
    return {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
    };
  }

  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let recentVideosCount = 0;

  const { today, yesterday, dayBeforeYesterday } = getJstRecentDates();

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

    const stats = video.tiktok_video_stats as Array<{
      view_count: number | null;
      like_count: number | null;
      comment_count: number | null;
      share_count: number | null;
      recorded_at: string;
    }>;

    const sortedStats = stats.sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    );

    const latestStats = sortedStats[0];
    if (latestStats) {
      totalLikes += latestStats.like_count ?? 0;
      totalComments += latestStats.comment_count ?? 0;
      totalShares += latestStats.share_count ?? 0;
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
    totalShares,
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
  const supabase = createClient();

  // JOINを使って1つのクエリで取得（URI too long エラーを回避）
  let query = supabase
    .from("tiktok_video_stats")
    .select(
      `
      recorded_at,
      view_count,
      like_count,
      tiktok_videos!inner(
        published_at,
        is_active
      )
    `,
    )
    .eq("tiktok_videos.is_active", true)
    .order("recorded_at", { ascending: true });

  // 動画の公開日でフィルター
  if (startDate) {
    query = query.gte("tiktok_videos.published_at", startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query = query.lt("tiktok_videos.published_at", endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch overall stats history:", error);
    return [];
  }

  const dailyStats = new Map<
    string,
    { total_views: number; total_likes: number }
  >();

  for (const stat of data || []) {
    const date = stat.recorded_at;
    const current = dailyStats.get(date) || { total_views: 0, total_likes: 0 };
    dailyStats.set(date, {
      total_views: current.total_views + (stat.view_count ?? 0),
      total_likes: current.total_likes + (stat.like_count ?? 0),
    });
  }

  // 配列に変換して本日以降のデータを除外
  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  const result = Array.from(dailyStats.entries())
    .map(([date, stats]) => ({
      date,
      total_views: stats.total_views,
      total_likes: stats.total_likes,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

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
  const supabase = createClient();

  const effectiveStartDate = startDate || new Date("2026-01-01");
  const effectiveEndDate = endDate || new Date();

  let query = supabase
    .from("tiktok_videos")
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

  const dailyCount = new Map<string, number>();

  for (const video of data || []) {
    if (!video.published_at) continue;
    const date = video.published_at.split("T")[0];
    dailyCount.set(date, (dailyCount.get(date) || 0) + 1);
  }

  const result: VideoCountByDateItem[] = [];
  effectiveEndDate.setHours(0, 0, 0, 0);

  const currentDate = new Date(effectiveStartDate);
  while (currentDate <= effectiveEndDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: dailyCount.get(dateStr) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 本日以降のデータを除外
  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  return filterBeforeToday(result);
}
