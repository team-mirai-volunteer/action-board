import type { Tables } from "@/lib/types/supabase";

export type YouTubeVideo = Tables<"youtube_videos">;
export type YouTubeVideoStats = Tables<"youtube_video_stats">;

export interface YouTubeVideoWithStats extends YouTubeVideo {
  latest_view_count: number | null;
  latest_like_count: number | null;
  latest_comment_count: number | null;
}

export interface StatsHistory {
  recorded_at: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
}

export interface StatsSummary {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
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

export type PeriodType = "30" | "90" | "180" | "365" | "all" | "custom";

export const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "30", label: "過去30日" },
  { value: "90", label: "過去90日" },
  { value: "180", label: "過去6ヶ月" },
  { value: "365", label: "過去1年" },
  { value: "all", label: "全期間" },
  { value: "custom", label: "カスタム" },
];

export function getPeriodStartDate(
  period: PeriodType,
  customStart?: string,
): Date | null {
  if (period === "custom" && customStart) {
    return new Date(customStart);
  }
  if (period === "all") {
    return new Date("2025-05-01");
  }
  if (period === "custom") {
    return new Date("2025-05-01");
  }
  const days = Number.parseInt(period, 10);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export function getPeriodEndDate(customEnd?: string): Date | null {
  if (customEnd) {
    return new Date(customEnd);
  }
  return null;
}
