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
