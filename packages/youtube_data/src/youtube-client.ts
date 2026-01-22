import { google } from "googleapis";
import type { YouTubeSearchResult, YouTubeVideoDetails } from "./types.js";

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
  let pageCount = 0;

  console.log("[YouTube API] Search request:");
  console.log(`  Query: ${HASHTAG}`);
  console.log(`  maxResults: ${maxResults}`);
  console.log(`  publishedAfter: ${publishedAfter ?? "(none)"}`);
  console.log(`  publishedBefore: ${publishedBefore ?? "(none)"}`);

  // ページネーションで全件取得
  while (videoIds.length < maxResults) {
    pageCount++;
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

    const pageInfo = response.data.pageInfo;
    console.log(`[YouTube API] Page ${pageCount} response:`);
    console.log(`  totalResults: ${pageInfo?.totalResults ?? "unknown"}`);
    console.log(`  resultsPerPage: ${pageInfo?.resultsPerPage ?? "unknown"}`);
    console.log(`  items returned: ${response.data.items?.length ?? 0}`);
    console.log(`  nextPageToken: ${response.data.nextPageToken ?? "(none)"}`);

    const items = response.data.items as YouTubeSearchResult[] | undefined;
    if (!items || items.length === 0) {
      console.log("[YouTube API] No more items, stopping pagination");
      break;
    }

    for (const item of items) {
      if (item.id?.videoId) {
        videoIds.push(item.id.videoId);
      }
    }

    pageToken = response.data.nextPageToken ?? undefined;
    if (!pageToken) {
      console.log("[YouTube API] No nextPageToken, stopping pagination");
      break;
    }
  }

  console.log(`[YouTube API] Total video IDs collected: ${videoIds.length}`);
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
