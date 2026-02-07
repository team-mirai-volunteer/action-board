/**
 * YouTubeいいね同期バッチスクリプト
 * 全ユーザーのYouTubeいいねを同期し、チームみらい動画へのいいねをミッションクリアとして記録する
 *
 * 使用方法:
 *   pnpm youtube:sync-likes         # 実行
 *   pnpm youtube:sync-likes:dry     # ドライラン
 */

import "dotenv/config";

import {
  isExpectedTokenError,
  isTokenExpired,
  refreshAccessToken,
} from "@/features/youtube/services/google-auth";
import { syncLikesForUser } from "@/features/youtube/services/sync-likes-core";
import { createAdminClient } from "@/lib/supabase/adminClient";

interface UserConnection {
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  display_name: string | null;
}

interface SyncResult {
  userId: string;
  displayName: string | null;
  success: boolean;
  syncedVideoCount?: number;
  achievedCount?: number;
  totalXpGranted?: number;
  error?: string;
  isExpectedError?: boolean;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    isDryRun: args.includes("--dry-run"),
  };
}

async function main() {
  const options = parseArgs();

  console.log("=== YouTube Likes Sync ===");
  console.log(`Mode: ${options.isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  const adminClient = await createAdminClient();

  // 全てのYouTube連携ユーザーを取得
  const { data: connections, error: connectionsError } = await adminClient
    .from("youtube_user_connections")
    .select(
      "user_id, access_token, refresh_token, token_expires_at, display_name",
    );

  if (connectionsError) {
    throw new Error(`Failed to fetch connections: ${connectionsError.message}`);
  }

  if (!connections || connections.length === 0) {
    console.log("No YouTube connected users found");
    return;
  }

  console.log(`Found ${connections.length} YouTube connected users\n`);

  if (options.isDryRun) {
    console.log("[DRY RUN] Would process the following users:");
    for (const conn of connections as UserConnection[]) {
      const userName = conn.display_name || conn.user_id.slice(0, 8);
      const tokenStatus = isTokenExpired(conn.token_expires_at)
        ? "expired (would refresh)"
        : "valid";
      console.log(`  - ${userName} (token: ${tokenStatus})`);
    }
    console.log("\n[DRY RUN] No changes made");
    return;
  }

  const results: SyncResult[] = [];

  // 各ユーザーを処理
  for (const connection of connections as UserConnection[]) {
    const userName = connection.display_name || connection.user_id.slice(0, 8);
    console.log(`Processing user: ${userName}`);

    try {
      let accessToken = connection.access_token;

      // トークンリフレッシュが必要か確認
      if (isTokenExpired(connection.token_expires_at)) {
        console.log("  Token expired, refreshing...");
        const newTokens = await refreshAccessToken(connection.refresh_token);
        accessToken = newTokens.access_token;

        // 新しいトークンを保存
        await adminClient
          .from("youtube_user_connections")
          .update({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token,
            token_expires_at: new Date(
              Date.now() + newTokens.expires_in * 1000,
            ).toISOString(),
          })
          .eq("user_id", connection.user_id);
      }

      // 同期を実行
      const result = await syncLikesForUser(connection.user_id, accessToken);

      results.push({
        userId: connection.user_id,
        displayName: connection.display_name,
        success: result.success,
        syncedVideoCount: result.syncedVideoCount,
        achievedCount: result.achievedCount,
        totalXpGranted: result.totalXpGranted,
        error: result.error,
      });

      console.log(
        `  Completed: synced=${result.syncedVideoCount}, achieved=${result.achievedCount}, xp=${result.totalXpGranted}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const expected = isExpectedTokenError(error);
      if (expected) {
        console.warn(`  Warning: ${errorMessage}`);
      } else {
        console.error(`  Error: ${errorMessage}`);
      }
      results.push({
        userId: connection.user_id,
        displayName: connection.display_name,
        success: false,
        error: errorMessage,
        isExpectedError: expected,
      });
    }
  }

  // 集計
  const summary = {
    totalUsers: results.length,
    successfulUsers: results.filter((r) => r.success).length,
    failedUsers: results.filter((r) => !r.success).length,
    totalSyncedVideos: results.reduce(
      (sum, r) => sum + (r.syncedVideoCount || 0),
      0,
    ),
    totalAchievements: results.reduce(
      (sum, r) => sum + (r.achievedCount || 0),
      0,
    ),
    totalXpGranted: results.reduce(
      (sum, r) => sum + (r.totalXpGranted || 0),
      0,
    ),
  };

  console.log("\n=== Sync Complete ===");
  console.log(`Total users: ${summary.totalUsers}`);
  console.log(`Successful: ${summary.successfulUsers}`);
  console.log(`Failed: ${summary.failedUsers}`);
  console.log(`Videos synced: ${summary.totalSyncedVideos}`);
  console.log(`Achievements: ${summary.totalAchievements}`);
  console.log(`XP granted: ${summary.totalXpGranted}`);

  const failedResults = results.filter((r) => !r.success);
  const expectedFailures = failedResults.filter((r) => r.isExpectedError);
  const unexpectedFailures = failedResults.filter((r) => !r.isExpectedError);

  // 想定内エラー（トークン失効など）はwarn表示
  if (expectedFailures.length > 0) {
    console.log(`\nExpected failures (${expectedFailures.length}):`);
    for (const user of expectedFailures) {
      console.warn(`  - ${user.displayName || user.userId}: ${user.error}`);
    }
  }

  // 想定外エラーがあればerror表示してexit(1)
  if (unexpectedFailures.length > 0) {
    console.log(`\nUnexpected failures (${unexpectedFailures.length}):`);
    for (const user of unexpectedFailures) {
      console.error(`  - ${user.displayName || user.userId}: ${user.error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
