import type {
  YouTubeVideoDetails,
  YouTubeVideoRecord,
  YouTubeVideoStatsRecord,
} from "./types.js";

export function toVideoRecord(video: YouTubeVideoDetails): YouTubeVideoRecord {
  return {
    video_id: video.id,
    video_url: `https://www.youtube.com/watch?v=${video.id}`,
    title: video.snippet.title,
    description: video.snippet.description || null,
    thumbnail_url:
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium?.url ||
      video.snippet.thumbnails.default?.url ||
      null,
    channel_id: video.snippet.channelId,
    channel_title: video.snippet.channelTitle || null,
    published_at: video.snippet.publishedAt || null,
    duration: video.contentDetails?.duration || null,
    tags: video.snippet.tags || null,
    is_active: true,
  };
}

export function toStatsRecord(
  videoId: string,
  video: YouTubeVideoDetails,
  recordedAt: string,
): YouTubeVideoStatsRecord {
  return {
    video_id: videoId,
    recorded_at: recordedAt,
    view_count: video.statistics?.viewCount
      ? Number.parseInt(video.statistics.viewCount, 10)
      : null,
    like_count: video.statistics?.likeCount
      ? Number.parseInt(video.statistics.likeCount, 10)
      : null,
    comment_count: video.statistics?.commentCount
      ? Number.parseInt(video.statistics.commentCount, 10)
      : null,
  };
}

export function getLatestPublishedAfter(
  videos: { published_at: string | null }[],
): string | undefined {
  if (videos.length === 0) {
    return undefined;
  }

  const latestPublishedAt = videos
    .filter((v) => v.published_at)
    .map((v) => new Date(v.published_at as string).getTime())
    .reduce((max, time) => Math.max(max, time), 0);

  if (latestPublishedAt === 0) {
    return undefined;
  }

  // 1秒追加して、最新の動画自体は除外する
  return new Date(latestPublishedAt + 1000).toISOString();
}

export function getOldestPublishedBefore(
  videos: { published_at: string | null }[],
): string | undefined {
  if (videos.length === 0) {
    return undefined;
  }

  const timestamps = videos
    .filter((v) => v.published_at)
    .map((v) => new Date(v.published_at as string).getTime());

  if (timestamps.length === 0) {
    return undefined;
  }

  const oldestPublishedAt = Math.min(...timestamps);

  // 1秒引いて、最古の動画自体は除外する
  return new Date(oldestPublishedAt - 1000).toISOString();
}
