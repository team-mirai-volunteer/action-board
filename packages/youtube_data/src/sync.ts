import "dotenv/config";
import {
  getLatestPublishedAfter,
  getOldestPublishedBefore,
  toStatsRecord,
  toVideoRecord,
} from "./converters.js";
import { fetchExistingVideos, insertVideo, upsertStats } from "./db.js";
import { getSupabaseClient } from "./supabase.js";
import type { SyncResult } from "./types.js";
import { getVideoDetails, searchVideosByHashtag } from "./youtube-client.js";

// CLIオプションのパース
function parseArgs() {
  const args = process.argv.slice(2);
  const getArg = (name: string): string | undefined => {
    const index = args.indexOf(name);
    return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
  };

  const maxResultsArg = getArg("--max-results");
  return {
    isDryRun: args.includes("--dry-run"),
    isBackfill: args.includes("--backfill"),
    maxResults: maxResultsArg ? Number.parseInt(maxResultsArg, 10) : undefined,
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
  console.log("");

  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. 既存動画を取得
  console.log("Fetching existing videos from database...");
  const existingVideos = await fetchExistingVideos(supabase);
  const existingVideoMap = new Map(
    existingVideos.map((v) => [v.video_id, v.id]),
  );
  const existingVideoIds = existingVideos.map((v) => v.video_id);
  console.log(`Found ${existingVideoIds.length} existing videos in database`);

  // 2. 検索オプションを決定
  let publishedAfter: string | undefined;
  let publishedBefore: string | undefined;
  const maxResults = options.maxResults ?? 50;

  if (options.isBackfill) {
    // backfillモード: DBの最古の動画より前を検索
    publishedBefore = getOldestPublishedBefore(existingVideos);
    if (!publishedBefore) {
      console.log("No existing videos found. Run normal sync first.");
      return result;
    }
  } else {
    // 通常モード: DBの最新の動画より後を検索
    publishedAfter = getLatestPublishedAfter(existingVideos);
  }

  if (publishedAfter) {
    console.log(`Published after: ${publishedAfter}`);
  }
  if (publishedBefore) {
    console.log(`Published before: ${publishedBefore}`);
  }
  console.log(`Max results: ${maxResults}`);

  // 3. 動画を検索
  console.log("\nSearching for videos with #チームみらい hashtag...");
  const searchedVideoIds = await searchVideosByHashtag({
    maxResults,
    publishedAfter,
    publishedBefore,
  });
  const newVideoIds = searchedVideoIds.filter(
    (id) => !existingVideoMap.has(id),
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
    const existingId = existingVideoMap.get(video.id);
    if (!existingId) continue;

    try {
      await upsertStats(supabase, toStatsRecord(existingId, video, today));
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
