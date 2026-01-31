import "dotenv/config";
import { getSupabaseClient } from "../common/supabase.js";
import {
  getLatestPublishedAfter,
  getOldestPublishedBefore,
  toStatsRecord,
  toVideoRecord,
} from "./converters.js";
import { fetchExistingVideos, insertVideo, upsertStats } from "./db.js";
import type { SyncResult } from "./types.js";
import { getVideoDetails, searchVideosByHashtag } from "./youtube-client.js";

// 日付文字列をISO 8601形式に変換（YouTube APIが要求する形式）
function toISOTimestamp(dateStr: string): string {
  // すでにタイムゾーン情報がある場合はそのまま返す
  if (dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  // YYYY-MM-DD形式の場合、T00:00:00Zを付加
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T00:00:00Z`;
  }
  // その他の場合はDateオブジェクトを経由して変換
  return new Date(dateStr).toISOString();
}

// CLIオプションのパース
function parseArgs() {
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
  };

  const maxResultsArg = getArg("--max-results");
  const publishedAfterArg = getArg("--published-after");
  const publishedBeforeArg = getArg("--published-before");

  return {
    isDryRun: args.includes("--dry-run"),
    isBackfill: args.includes("--backfill"),
    maxResults: maxResultsArg ? Number.parseInt(maxResultsArg, 10) : undefined,
    publishedAfter: publishedAfterArg
      ? toISOTimestamp(publishedAfterArg)
      : undefined,
    publishedBefore: publishedBeforeArg
      ? toISOTimestamp(publishedBeforeArg)
      : undefined,
  };
}

const options = parseArgs();

async function syncYouTubeVideos(): Promise<SyncResult> {
  const result: SyncResult = {
    newVideos: 0,
    updatedVideos: 0,
    statsRecorded: 0,
    errors: [],
  };

  console.log("=== YouTube Videos Sync ===");
  console.log(`Mode: ${options.isDryRun ? "DRY RUN" : "LIVE"}`);
  if (options.isBackfill) {
    console.log("Backfill mode: ON (fetching older videos)");
  }

  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. 既存動画を取得
  console.log("Fetching existing videos from database...");
  const existingVideos = await fetchExistingVideos(supabase);
  const existingVideoIdSet = new Set(existingVideos.map((v) => v.video_id));
  const existingVideoIds = existingVideos.map((v) => v.video_id);
  console.log(`Found ${existingVideoIds.length} existing videos in database`);

  // 2. 検索オプションを決定
  let publishedAfter: string | undefined;
  let publishedBefore: string | undefined;
  const maxResults = options.maxResults ?? 100;

  // コマンド引数でオーバーライド可能
  if (options.publishedAfter) {
    publishedAfter = options.publishedAfter;
    console.log("Using --published-after override");
  } else if (!options.isBackfill) {
    // 通常モード: DBの最新の動画より後を検索
    publishedAfter = getLatestPublishedAfter(existingVideos);
  }

  if (options.publishedBefore) {
    publishedBefore = options.publishedBefore;
    console.log("Using --published-before override");
  } else if (options.isBackfill) {
    // backfillモード: DBの最古の動画より前を検索
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
  let existingVideoDetails: Awaited<ReturnType<typeof getVideoDetails>> = [];
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
      const videoId = await insertVideo(supabase, toVideoRecord(video));
      result.newVideos++;
      console.log(`Inserted: ${video.snippet.title}`);

      await upsertStats(supabase, toStatsRecord(videoId, video, today));
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
      // video.idがそのままyoutube_videos.video_id（PRIMARY KEY）
      await upsertStats(supabase, toStatsRecord(video.id, video, today));
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

async function main() {
  try {
    const result = await syncYouTubeVideos();

    console.log("\n=== Sync Complete ===");
    console.log(`New videos: ${result.newVideos}`);
    console.log(`Updated videos (stats): ${result.updatedVideos}`);
    console.log(`Stats recorded: ${result.statsRecorded}`);

    if (result.errors.length > 0) {
      console.log(`\nErrors (${result.errors.length}):`);
      for (const error of result.errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
