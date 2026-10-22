import "server-only";

import { createAdminClient } from "@/lib/supabase/adminClient";
import type { Database } from "@/lib/types/supabase";
import { fromCacheDate, toPublishedRange } from "@/lib/utils/published-range";
import { cacheVideoStatsQuery, toCount } from "@/lib/utils/video-stats-cache";
import type {
  OverallStatsHistoryItem,
  SortType,
  StatsSummary,
  TikTokVideoWithStats,
  VideoCountByDateItem,
} from "../types";
import { generateDateRange } from "../utils/stats-utils";

type TikTokSummaryRow =
  Database["public"]["Functions"]["get_tiktok_stats_summary"]["Returns"][number];
type TikTokHistoryRow =
  Database["public"]["Functions"]["get_tiktok_overall_stats_history"]["Returns"][number];
type TikTokCountByDateRow =
  Database["public"]["Functions"]["get_tiktok_video_count_by_date"]["Returns"][number];

const EMPTY_SUMMARY: StatsSummary = {
  totalVideos: 0,
  totalViews: 0,
  totalLikes: 0,
  totalComments: 0,
  totalShares: 0,
};

function mapSummary(row: TikTokSummaryRow | undefined): StatsSummary {
  if (!row) return EMPTY_SUMMARY;
  return {
    totalVideos: toCount(row.total_videos),
    totalViews: toCount(row.total_views),
    totalLikes: toCount(row.total_likes),
    totalComments: toCount(row.total_comments),
    totalShares: toCount(row.total_shares),
    dailyViewsIncrease: toCount(row.daily_views_increase),
    dailyVideosIncrease: toCount(row.daily_videos_increase),
  };
}

async function fetchTikTokVideosWithStats(
  publishedFrom: string,
  publishedTo: string,
  sortBy: SortType,
  limit: number,
  offset: number,
): Promise<TikTokVideoWithStats[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_tiktok_videos_with_latest_stats",
    {
      published_from: fromCacheDate(publishedFrom),
      published_to: fromCacheDate(publishedTo),
      sort_by: sortBy,
      result_limit: limit,
      result_offset: offset,
    },
  );

  if (error) throw error;
  return data ?? [];
}

const fetchTikTokVideosWithStatsCached = cacheVideoStatsQuery(
  "tiktok-videos-with-latest-stats",
  fetchTikTokVideosWithStats,
);

/**
 * TikTok動画一覧を最新統計付きで取得する。
 * 統計履歴は埋め込まず、各動画の最新行だけを RPC で受け取る。
 */
export async function getTikTokVideosWithStats(
  limit: number,
  offset: number,
  sortBy: SortType,
  startDate?: Date,
  endDate?: Date,
): Promise<TikTokVideoWithStats[]> {
  const { publishedFrom, publishedTo } = toPublishedRange(startDate, endDate);
  try {
    return await fetchTikTokVideosWithStatsCached(
      publishedFrom,
      publishedTo,
      sortBy,
      limit,
      offset,
    );
  } catch (error) {
    console.error("Failed to fetch TikTok videos:", error);
    return [];
  }
}

async function fetchTikTokVideoCount(
  publishedFrom: string,
  publishedTo: string,
): Promise<number> {
  const supabase = await createAdminClient();
  let query = supabase
    .from("tiktok_videos")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const from = fromCacheDate(publishedFrom);
  const to = fromCacheDate(publishedTo);
  if (from) query = query.gte("published_at", from);
  if (to) query = query.lt("published_at", to);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

const fetchTikTokVideoCountCached = cacheVideoStatsQuery(
  "tiktok-video-count",
  fetchTikTokVideoCount,
);

/**
 * TikTok動画の総数を取得する
 */
export async function getTikTokVideoCount(
  startDate?: Date,
  endDate?: Date,
): Promise<number> {
  const { publishedFrom, publishedTo } = toPublishedRange(startDate, endDate);
  try {
    return await fetchTikTokVideoCountCached(publishedFrom, publishedTo);
  } catch (error) {
    console.error("Failed to fetch TikTok video count:", error);
    return 0;
  }
}

async function fetchTikTokStatsSummary(
  publishedFrom: string,
  publishedTo: string,
): Promise<StatsSummary> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc("get_tiktok_stats_summary", {
    published_from: fromCacheDate(publishedFrom),
    published_to: fromCacheDate(publishedTo),
  });

  if (error) throw error;
  return mapSummary(data?.[0]);
}

const fetchTikTokStatsSummaryCached = cacheVideoStatsQuery(
  "tiktok-stats-summary",
  fetchTikTokStatsSummary,
);

/**
 * TikTok動画のサマリー統計を取得する。
 * 合計と日次増加は get_tiktok_stats_summary が DB 側で計算する。
 * 結果は 1 時間キャッシュする（get-metrics.ts の revalidate: 3600 と同じ間隔）。
 */
export async function getTikTokStatsSummary(
  startDate?: Date,
  endDate?: Date,
): Promise<StatsSummary> {
  const { publishedFrom, publishedTo } = toPublishedRange(startDate, endDate);
  try {
    return await fetchTikTokStatsSummaryCached(publishedFrom, publishedTo);
  } catch (error) {
    console.error("Failed to fetch TikTok stats summary:", error);
    return EMPTY_SUMMARY;
  }
}

async function fetchOverallStatsHistory(
  publishedFrom: string,
  publishedTo: string,
): Promise<OverallStatsHistoryItem[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_tiktok_overall_stats_history",
    {
      published_from: fromCacheDate(publishedFrom),
      published_to: fromCacheDate(publishedTo),
    },
  );

  if (error) throw error;

  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  const items = ((data ?? []) as TikTokHistoryRow[]).map((row) => ({
    date: row.date,
    total_views: toCount(row.total_views),
    total_likes: toCount(row.total_likes),
  }));
  return filterBeforeToday(items);
}

const fetchOverallStatsHistoryCached = cacheVideoStatsQuery(
  "tiktok-overall-stats-history",
  fetchOverallStatsHistory,
);

/**
 * 全体の日別統計推移を取得する（期間内に公開された動画のみ）。
 * 日別合計は DB 側で作る。本日以降は除外する。
 */
export async function getOverallStatsHistory(
  startDate?: Date,
  endDate?: Date,
): Promise<OverallStatsHistoryItem[]> {
  const { publishedFrom, publishedTo } = toPublishedRange(startDate, endDate);
  try {
    return await fetchOverallStatsHistoryCached(publishedFrom, publishedTo);
  } catch (error) {
    console.error("Failed to fetch overall stats history:", error);
    return [];
  }
}

async function fetchVideoCountByDate(
  publishedFrom: string,
  publishedTo: string,
  startIso: string,
  endIso: string,
): Promise<VideoCountByDateItem[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.rpc("get_tiktok_video_count_by_date", {
    published_from: fromCacheDate(publishedFrom),
    published_to: fromCacheDate(publishedTo),
  });

  if (error) throw error;

  const dailyCount = new Map<string, number>();
  for (const row of (data ?? []) as TikTokCountByDateRow[]) {
    dailyCount.set(row.date, toCount(row.count));
  }

  const { filterBeforeToday } = await import("@/lib/utils/date-utils");
  return filterBeforeToday(
    generateDateRange(new Date(startIso), new Date(endIso), dailyCount),
  );
}

const fetchVideoCountByDateCached = cacheVideoStatsQuery(
  "tiktok-video-count-by-date",
  fetchVideoCountByDate,
);

/**
 * 日別の動画投稿数を取得する。
 * 件数は DB で日別に集計し、0 件の日は従来どおりアプリ側で埋める。
 */
export async function getVideoCountByDate(
  startDate?: Date,
  endDate?: Date,
): Promise<VideoCountByDateItem[]> {
  const effectiveStartDate = startDate || new Date("2026-01-01");
  const effectiveEndDate = endDate || new Date();
  const { publishedFrom, publishedTo } = toPublishedRange(
    effectiveStartDate,
    effectiveEndDate,
  );

  try {
    return await fetchVideoCountByDateCached(
      publishedFrom,
      publishedTo,
      effectiveStartDate.toISOString(),
      effectiveEndDate.toISOString(),
    );
  } catch (error) {
    console.error("Failed to fetch video count by date:", error);
    return [];
  }
}
