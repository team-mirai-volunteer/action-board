import type { Tables } from "@/lib/types/supabase";

export type { PeriodType } from "@/lib/utils/period-date-utils";
export {
  getPeriodEndDate,
  getPeriodStartDate,
  PERIOD_OPTIONS,
} from "@/lib/utils/period-date-utils";

export type TikTokVideo = Tables<"tiktok_videos">;
export type TikTokVideoStats = Tables<"tiktok_video_stats">;

export interface TikTokVideoWithStats extends TikTokVideo {
  latest_view_count: number | null;
  latest_like_count: number | null;
  latest_comment_count: number | null;
  latest_share_count: number | null;
}

export interface StatsHistory {
  recorded_at: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
}

export interface StatsSummary {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  dailyViewsIncrease?: number;
  dailyVideosIncrease?: number;
}

export interface OverallStatsHistoryItem {
  date: string;
  total_views: number;
  total_likes: number;
}

export interface VideoCountByDateItem {
  date: string;
  count: number;
}

export type SortType = "published_at" | "view_count" | "like_count";

export const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "published_at", label: "公開日順" },
  { value: "view_count", label: "再生数順" },
  { value: "like_count", label: "いいね順" },
];
