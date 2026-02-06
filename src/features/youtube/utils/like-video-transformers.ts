import type { RecordedLike } from "../actions/youtube-like-actions";
import type { YouTubeVideoWithStats } from "../types";

/**
 * DBから取得したいいね記録を、youtube_videos情報が存在するものだけフィルタして
 * RecordedLike形式に変換する
 */
export function transformValidLikesToRecordedLikes(
  likes: Array<{
    video_id: string;
    detected_at: string | null;
    created_at: string | null;
    youtube_videos: {
      title: string;
      channel_title: string;
      video_url: string | null;
      thumbnail_url: string | null;
      published_at: string | null;
    } | null;
  }>,
): RecordedLike[] {
  return likes
    .filter((like) => like.youtube_videos)
    .map((like) => ({
      videoId: like.video_id,
      title: like.youtube_videos?.title || "Unknown",
      channelTitle: like.youtube_videos?.channel_title || undefined,
      thumbnailUrl: like.youtube_videos?.thumbnail_url || undefined,
      videoUrl:
        like.youtube_videos?.video_url ||
        `https://www.youtube.com/watch?v=${like.video_id}`,
      publishedAt: like.youtube_videos?.published_at || undefined,
      recordedAt:
        like.detected_at || like.created_at || new Date().toISOString(),
    }));
}

/**
 * youtube_videosに関連するyoutube_video_statsから最新の統計情報を付加して
 * YouTubeVideoWithStats形式に変換する
 */
export function enrichVideosWithLatestStats(
  videos: Array<{
    video_id: string;
    video_url: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    channel_id: string;
    channel_title: string;
    published_at: string;
    duration: string | null;
    tags: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    comments_synced_at: string | null;
    youtube_video_stats: Array<{
      view_count: number | null;
      like_count: number | null;
      comment_count: number | null;
      recorded_at: string;
    }>;
  }>,
): YouTubeVideoWithStats[] {
  return videos.map((video) => {
    const stats = video.youtube_video_stats;

    // 最新の統計を取得
    const latestStats = stats?.sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
    )[0];

    return {
      video_id: video.video_id,
      video_url: video.video_url,
      title: video.title,
      description: video.description,
      thumbnail_url: video.thumbnail_url,
      channel_id: video.channel_id,
      channel_title: video.channel_title,
      published_at: video.published_at,
      duration: video.duration,
      tags: video.tags,
      is_active: video.is_active,
      created_at: video.created_at,
      updated_at: video.updated_at,
      comments_synced_at: video.comments_synced_at,
      latest_view_count: latestStats?.view_count ?? null,
      latest_like_count: latestStats?.like_count ?? null,
      latest_comment_count: latestStats?.comment_count ?? null,
    };
  });
}
