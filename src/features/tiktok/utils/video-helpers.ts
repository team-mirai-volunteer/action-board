import { getLatestStats } from "@/features/tiktok-stats/utils/stats-utils";
import type { TikTokVideo, TikTokVideoStats } from "../types";

/**
 * VideoWithStats: DBから取得したTikTok動画（統計データ付き）の型
 */
export interface VideoWithStats {
  id: string;
  video_id: string;
  user_id: string | null;
  creator_id: string;
  creator_username: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  published_at: string | null;
  duration: number | null;
  tags: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tiktok_video_stats: Array<{
    view_count: number | null;
    like_count: number | null;
    comment_count: number | null;
    share_count: number | null;
    recorded_at: string;
  }>;
}

/**
 * 動画に最新統計データを付与する
 */
export function attachLatestStats(
  video: VideoWithStats,
): TikTokVideo & { latest_stats?: TikTokVideoStats } {
  const stats = video.tiktok_video_stats || [];
  const latestStats = getLatestStats(stats);

  return {
    ...video,
    tiktok_video_stats: undefined,
    latest_stats: latestStats
      ? {
          id: "",
          tiktok_video_id: video.id,
          recorded_at: latestStats.recorded_at,
          view_count: latestStats.view_count,
          like_count: latestStats.like_count,
          comment_count: latestStats.comment_count,
          share_count: latestStats.share_count,
          created_at: "",
        }
      : undefined,
  } as TikTokVideo & { latest_stats?: TikTokVideoStats };
}

/**
 * TikTok動画をソートする
 */
export function sortTikTokVideos(
  videos: (TikTokVideo & { latest_stats?: TikTokVideoStats })[],
  sortBy: "published_at" | "view_count" | "like_count",
): (TikTokVideo & { latest_stats?: TikTokVideoStats })[] {
  return [...videos].sort((a, b) => {
    switch (sortBy) {
      case "view_count":
        return (
          (b.latest_stats?.view_count ?? 0) - (a.latest_stats?.view_count ?? 0)
        );
      case "like_count":
        return (
          (b.latest_stats?.like_count ?? 0) - (a.latest_stats?.like_count ?? 0)
        );
      default:
        return (
          new Date(b.published_at ?? 0).getTime() -
          new Date(a.published_at ?? 0).getTime()
        );
    }
  });
}

/**
 * 日付をYYYY-MM-DD形式にフォーマットする
 */
export function formatDateToYMD(date: Date): string {
  return date.toISOString().split("T")[0];
}
