/**
 * YouTube動画同期バッチスクリプト
 * #チームみらい ハッシュタグで動画を検索し、DBに同期する
 *
 * 使用方法:
 *   pnpm youtube:sync-videos              # 通常同期（新しい動画を取得）
 *   pnpm youtube:sync-videos --dry-run    # ドライラン
 *   pnpm youtube:sync-videos --backfill   # 過去の動画を取得
 */

import "dotenv/config";

import {
  syncYouTubeVideos,
  type VideoSyncResult,
} from "@/features/youtube/services/youtube-video-sync-service";
import { parseArgs } from "@/lib/utils/script-cli-utils";

async function main() {
  const options = parseArgs();

  console.log("=== YouTube Videos Sync ===");
  console.log(`Mode: ${options.isDryRun ? "DRY RUN" : "LIVE"}`);
  if (options.isBackfill) {
    console.log("Backfill mode: ON (fetching older videos)");
  }
  if (options.publishedAfter) {
    console.log("Using --published-after override");
  }
  if (options.publishedBefore) {
    console.log("Using --published-before override");
  }

  try {
    const result: VideoSyncResult = await syncYouTubeVideos({
      isDryRun: options.isDryRun,
      isBackfill: options.isBackfill,
      maxResults: options.maxResults,
      publishedAfter: options.publishedAfter,
      publishedBefore: options.publishedBefore,
    });

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
