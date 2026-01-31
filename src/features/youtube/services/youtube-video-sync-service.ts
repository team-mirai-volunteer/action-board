/**
 * YouTube動画同期サービス
 * #チームみらい ハッシュタグで動画を検索し、DBに同期する
 */

import { google } from "googleapis";
import { createAdminClient } from "@/lib/supabase/adminClient";

const HASHTAG = "#チームみらい";

// YouTube API クライアントを初期化
function getYouTubeClient() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is not set");
  }

  return google.youtube({
    version: "v3",
    auth: apiKey,
  });
}

// YouTube API から取得する動画データの型定義

export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
}

export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

// DBに保存する動画データの型
export interface YouTubeVideoRecord {
  video_id: string;
  video_url: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  channel_id: string;
  channel_title: string | null;
  published_at: string | null;
  duration: string | null;
  tags: string[] | null;
  is_active: boolean;
}

// DBに保存する統計スナップショットの型
export interface YouTubeVideoStatsRecord {
  video_id: string;
  recorded_at: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
}

// 同期結果のサマリー
export interface VideoSyncResult {
  newVideos: number;
  updatedVideos: number;
  statsRecorded: number;
  errors: string[];
}

export interface SearchOptions {
  maxResults?: number;
  /** ISO 8601形式の日時。この日時以降に公開された動画のみを検索 */
  publishedAfter?: string;
  /** ISO 8601形式の日時。この日時以前に公開された動画のみを検索 */
  publishedBefore?: string;
}

/**
 * ハッシュタグで動画を検索する
 * @param options 検索オプション
 * @returns 検索結果の動画ID一覧
 */
export async function searchVideosByHashtag(
  options: SearchOptions = {},
): Promise<string[]> {
  const { maxResults = 50, publishedAfter, publishedBefore } = options;
  const youtube = getYouTubeClient();
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  while (videoIds.length < maxResults) {
    const response = await youtube.search.list({
      part: ["snippet"],
      q: HASHTAG,
      type: ["video"],
      maxResults: Math.min(50, maxResults - videoIds.length),
      order: "date",
      regionCode: "JP",
      pageToken,
      publishedAfter,
      publishedBefore,
    });

    const items = response.data.items as YouTubeSearchResult[] | undefined;
    if (!items || items.length === 0) {
      break;
    }

    for (const item of items) {
      if (item.id?.videoId) {
        videoIds.push(item.id.videoId);
      }
    }

    pageToken = response.data.nextPageToken ?? undefined;
    if (!pageToken) {
      break;
    }
  }

  return videoIds;
}

/**
 * 動画の詳細情報を取得する（統計情報含む）
 * @param videoIds 動画IDの配列
 * @returns 動画詳細情報の配列
 */
export async function getVideoDetails(
  videoIds: string[],
): Promise<YouTubeVideoDetails[]> {
  if (videoIds.length === 0) {
    return [];
  }

  const youtube = getYouTubeClient();
  const allDetails: YouTubeVideoDetails[] = [];

  // YouTube API は1リクエストで50件まで
  const chunkSize = 50;
  for (let i = 0; i < videoIds.length; i += chunkSize) {
    const chunk = videoIds.slice(i, i + chunkSize);

    const response = await youtube.videos.list({
      part: ["snippet", "statistics", "contentDetails"],
      id: chunk,
    });

    const items = response.data.items as YouTubeVideoDetails[] | undefined;
    if (items) {
      allDetails.push(...items);
    }
  }

  return allDetails;
}

// 変換関数

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

// DB操作関数

export interface ExistingVideo {
  video_id: string;
  published_at: string | null;
}

export async function fetchExistingVideos(): Promise<ExistingVideo[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from("youtube_videos")
    .select("video_id, published_at")
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch existing videos: ${error.message}`);
  }

  return data || [];
}

export async function insertVideo(record: YouTubeVideoRecord): Promise<string> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("youtube_videos").insert(record);

  if (error) {
    throw new Error(
      `Failed to insert video ${record.video_id}: ${error.message}`,
    );
  }

  return record.video_id;
}

export async function upsertStats(
  record: YouTubeVideoStatsRecord,
): Promise<void> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("youtube_video_stats").upsert(record, {
    onConflict: "video_id,recorded_at",
  });

  if (error) {
    throw new Error(`Failed to record stats: ${error.message}`);
  }
}

export interface SyncOptions {
  isDryRun?: boolean;
  isBackfill?: boolean;
  maxResults?: number;
  publishedAfter?: string;
  publishedBefore?: string;
}

/**
 * YouTube動画を同期する
 */
export async function syncYouTubeVideos(
  options: SyncOptions = {},
): Promise<VideoSyncResult> {
  const result: VideoSyncResult = {
    newVideos: 0,
    updatedVideos: 0,
    statsRecorded: 0,
    errors: [],
  };

  const today = new Date().toISOString().split("T")[0];

  // 1. 既存動画を取得
  console.log("Fetching existing videos from database...");
  const existingVideos = await fetchExistingVideos();
  const existingVideoIdSet = new Set(existingVideos.map((v) => v.video_id));
  const existingVideoIds = existingVideos.map((v) => v.video_id);
  console.log(`Found ${existingVideoIds.length} existing videos in database`);

  // 2. 検索オプションを決定
  let publishedAfter: string | undefined;
  let publishedBefore: string | undefined;
  const maxResults = options.maxResults ?? 100;

  if (options.publishedAfter) {
    publishedAfter = options.publishedAfter;
  } else if (!options.isBackfill) {
    publishedAfter = getLatestPublishedAfter(existingVideos);
  }

  if (options.publishedBefore) {
    publishedBefore = options.publishedBefore;
  } else if (options.isBackfill) {
    publishedBefore = getOldestPublishedBefore(existingVideos);
    if (!publishedBefore && !options.publishedAfter) {
      console.log("No existing videos found. Run normal sync first.");
      return result;
    }
  }

  if (publishedAfter) {
    console.log(`Published after: ${publishedAfter}`);
  }
  if (publishedBefore) {
    console.log(`Published before: ${publishedBefore}`);
  }
  console.log(`Max results: ${maxResults}`);

  // 3. 動画を検索
  console.log("Searching for videos with #チームみらい hashtag...");
  const searchedVideoIds = await searchVideosByHashtag({
    maxResults,
    publishedAfter,
    publishedBefore,
  });
  const newVideoIds = searchedVideoIds.filter(
    (id) => !existingVideoIdSet.has(id),
  );
  console.log(
    `Found ${searchedVideoIds.length} videos from search, ${newVideoIds.length} are new`,
  );

  // 4. 新規動画の詳細を取得
  const newVideoDetails =
    newVideoIds.length > 0 ? await getVideoDetails(newVideoIds) : [];

  if (newVideoDetails.length > 0) {
    console.log(`Retrieved details for ${newVideoDetails.length} new videos`);
  }

  // 5. 既存動画の統計更新（backfillモードではスキップ）
  let existingVideoDetails: YouTubeVideoDetails[] = [];
  if (!options.isBackfill && existingVideoIds.length > 0) {
    console.log("Fetching updated stats for existing videos...");
    existingVideoDetails = await getVideoDetails(existingVideoIds);
    console.log(
      `Retrieved stats for ${existingVideoDetails.length} existing videos`,
    );
  }

  // ドライラン
  if (options.isDryRun) {
    console.log("\n[DRY RUN] Would process:");
    console.log(`  New videos: ${newVideoDetails.length}`);
    for (const video of newVideoDetails) {
      console.log(`    - ${video.snippet.title} (${video.id})`);
    }
    if (!options.isBackfill) {
      console.log(
        `  Existing videos to update stats: ${existingVideoDetails.length}`,
      );
    }
    return result;
  }

  // 6. 新規動画を保存
  for (const video of newVideoDetails) {
    try {
      const videoId = await insertVideo(toVideoRecord(video));
      result.newVideos++;
      console.log(`Inserted: ${video.snippet.title}`);

      await upsertStats(toStatsRecord(videoId, video, today));
      result.statsRecorded++;
    } catch (err) {
      result.errors.push(
        `Error processing new video ${video.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // 7. 既存動画の統計を更新（backfillモードではスキップ）
  for (const video of existingVideoDetails) {
    if (!existingVideoIdSet.has(video.id)) continue;

    try {
      await upsertStats(toStatsRecord(video.id, video, today));
      result.statsRecorded++;
      result.updatedVideos++;
    } catch (err) {
      result.errors.push(
        `Error updating stats for video ${video.id}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return result;
}
