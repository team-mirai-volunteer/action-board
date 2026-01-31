import "dotenv/config";
import {
  fetchAllConnections,
  updateTokens,
  upsertStats,
  upsertVideo,
} from "./db.js";
import { getSupabaseClient } from "./supabase.js";
import {
  TikTokAPIError,
  extractHashtags,
  fetchVideoList,
  filterTeamMiraiVideos,
  refreshAccessToken,
} from "./tiktok-client.js";
import type {
  SyncResult,
  TikTokUserConnection,
  TikTokVideoFromAPI,
  TikTokVideoRecord,
  TikTokVideoStatsRecord,
  UserSyncResult,
} from "./types.js";

// CLIオプションのパース
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    isDryRun: args.includes("--dry-run"),
  };
}

const options = parseArgs();

/**
 * トークンの有効期限をチェックし、必要ならリフレッシュする
 * @returns 有効なアクセストークン、またはnull（リフレッシュ不可の場合）
 */
async function ensureValidToken(
  supabase: ReturnType<typeof getSupabaseClient>,
  connection: TikTokUserConnection,
  isDryRun: boolean,
): Promise<{ accessToken: string; tokenRefreshed: boolean } | null> {
  const now = new Date();
  const tokenExpiresAt = new Date(connection.token_expires_at);
  const refreshTokenExpiresAt = connection.refresh_token_expires_at
    ? new Date(connection.refresh_token_expires_at)
    : null;

  // アクセストークンがまだ有効な場合
  if (tokenExpiresAt > now) {
    return { accessToken: connection.access_token, tokenRefreshed: false };
  }

  // リフレッシュトークンも期限切れの場合
  if (refreshTokenExpiresAt && refreshTokenExpiresAt < now) {
    console.log(
      `  [SKIP] Refresh token expired for user ${connection.display_name || connection.tiktok_open_id}`,
    );
    return null;
  }

  // トークンをリフレッシュ
  console.log(
    `  Refreshing token for user ${connection.display_name || connection.tiktok_open_id}...`,
  );

  if (isDryRun) {
    console.log("  [DRY RUN] Would refresh token");
    return { accessToken: connection.access_token, tokenRefreshed: true };
  }

  try {
    const newTokens = await refreshAccessToken(connection.refresh_token);
    await updateTokens(supabase, connection.id, newTokens);
    console.log("  Token refreshed successfully");
    return { accessToken: newTokens.access_token, tokenRefreshed: true };
  } catch (err) {
    console.error(
      `  Failed to refresh token: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

/**
 * 動画をレコードに変換
 */
function toVideoRecord(
  video: TikTokVideoFromAPI,
  userId: string,
  creatorId: string,
  creatorUsername: string | null,
): TikTokVideoRecord {
  return {
    video_id: video.id,
    user_id: userId,
    creator_id: creatorId,
    creator_username: creatorUsername,
    title: video.title || null,
    description: video.video_description || null,
    thumbnail_url: video.cover_image_url || null,
    video_url: video.share_url,
    published_at: video.create_time
      ? new Date(video.create_time * 1000).toISOString()
      : null,
    duration: video.duration || null,
    tags: extractHashtags(video.video_description || ""),
    is_active: true,
  };
}

/**
 * 統計をレコードに変換
 */
function toStatsRecord(
  tiktokVideoId: string,
  video: TikTokVideoFromAPI,
  recordedAt: string,
): TikTokVideoStatsRecord {
  return {
    tiktok_video_id: tiktokVideoId,
    recorded_at: recordedAt,
    view_count: video.view_count ?? null,
    like_count: video.like_count ?? null,
    comment_count: video.comment_count ?? null,
    share_count: video.share_count ?? null,
  };
}

/**
 * 単一ユーザーの動画を同期する
 */
async function syncUserVideos(
  supabase: ReturnType<typeof getSupabaseClient>,
  connection: TikTokUserConnection,
  accessToken: string,
  today: string,
  isDryRun: boolean,
): Promise<{
  newVideos: number;
  updatedVideos: number;
  statsRecorded: number;
}> {
  let newVideos = 0;
  let updatedVideos = 0;
  let statsRecorded = 0;
  let cursor: number | undefined;
  let hasMore = true;

  // ページネーションで全動画を取得
  while (hasMore) {
    const result = await fetchVideoList(accessToken, cursor);
    const teamMiraiVideos = filterTeamMiraiVideos(result.videos);

    console.log(
      `    Fetched ${result.videos.length} videos, ${teamMiraiVideos.length} are #チームみらい`,
    );

    if (isDryRun) {
      for (const video of teamMiraiVideos) {
        console.log(`    [DRY RUN] Would process: ${video.title || video.id}`);
      }
      newVideos += teamMiraiVideos.length;
    } else {
      for (const video of teamMiraiVideos) {
        try {
          const videoRecord = toVideoRecord(
            video,
            connection.user_id,
            connection.tiktok_open_id,
            connection.display_name,
          );

          const { id: videoId, isNew } = await upsertVideo(
            supabase,
            videoRecord,
          );

          if (isNew) {
            newVideos++;
            console.log(`    + New video: ${video.title || video.id}`);
          } else {
            updatedVideos++;
          }

          // 統計を保存
          const statsRecord = toStatsRecord(videoId, video, today);
          await upsertStats(supabase, statsRecord);
          statsRecorded++;
        } catch (err) {
          console.error(
            `    Error processing video ${video.id}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    // 次のページがなければ終了
    hasMore = result.hasMore;
    cursor = result.cursor;

    // レート制限対策のためウェイト
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return { newVideos, updatedVideos, statsRecorded };
}

/**
 * メイン同期処理
 */
async function syncTikTokVideos(): Promise<SyncResult> {
  const result: SyncResult = {
    totalUsers: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    newVideos: 0,
    updatedVideos: 0,
    statsRecorded: 0,
    tokensRefreshed: 0,
    errors: [],
  };

  console.log("=== TikTok Videos Sync ===");
  console.log(`Mode: ${options.isDryRun ? "DRY RUN" : "LIVE"}`);

  const supabase = getSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. 全連携ユーザーを取得
  console.log("\nFetching all TikTok connections...");
  const connections = await fetchAllConnections(supabase);
  result.totalUsers = connections.length;
  console.log(`Found ${connections.length} connected users`);

  if (connections.length === 0) {
    console.log("No users to sync");
    return result;
  }

  // 2. 各ユーザーの動画を同期
  const userResults: UserSyncResult[] = [];

  for (const connection of connections) {
    const userName = connection.display_name || connection.tiktok_open_id;
    console.log(`\n--- Syncing user: ${userName} ---`);

    const userResult: UserSyncResult = {
      userId: connection.user_id,
      tiktokOpenId: connection.tiktok_open_id,
      displayName: connection.display_name,
      success: false,
      newVideos: 0,
      updatedVideos: 0,
      statsRecorded: 0,
      tokenRefreshed: false,
    };

    try {
      // トークンの有効性を確認
      const tokenResult = await ensureValidToken(
        supabase,
        connection,
        options.isDryRun,
      );

      if (!tokenResult) {
        userResult.error = "Token refresh failed or refresh token expired";
        result.failedSyncs++;
        result.errors.push(`${userName}: ${userResult.error}`);
        userResults.push(userResult);
        continue;
      }

      userResult.tokenRefreshed = tokenResult.tokenRefreshed;
      if (tokenResult.tokenRefreshed) {
        result.tokensRefreshed++;
      }

      // 動画を同期
      const syncResult = await syncUserVideos(
        supabase,
        connection,
        tokenResult.accessToken,
        today,
        options.isDryRun,
      );

      userResult.success = true;
      userResult.newVideos = syncResult.newVideos;
      userResult.updatedVideos = syncResult.updatedVideos;
      userResult.statsRecorded = syncResult.statsRecorded;

      result.successfulSyncs++;
      result.newVideos += syncResult.newVideos;
      result.updatedVideos += syncResult.updatedVideos;
      result.statsRecorded += syncResult.statsRecorded;

      console.log(
        `  Completed: ${syncResult.newVideos} new, ${syncResult.updatedVideos} updated, ${syncResult.statsRecorded} stats`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof TikTokAPIError
          ? `TikTok API Error: ${err.message} (code: ${err.code})`
          : err instanceof Error
            ? err.message
            : String(err);

      userResult.error = errorMessage;
      result.failedSyncs++;
      result.errors.push(`${userName}: ${errorMessage}`);
      console.error(`  Error: ${errorMessage}`);
    }

    userResults.push(userResult);
  }

  return result;
}

async function main() {
  try {
    const result = await syncTikTokVideos();

    console.log("\n=== Sync Complete ===");
    console.log(`Total users: ${result.totalUsers}`);
    console.log(`Successful syncs: ${result.successfulSyncs}`);
    console.log(`Failed syncs: ${result.failedSyncs}`);
    console.log(`New videos: ${result.newVideos}`);
    console.log(`Updated videos: ${result.updatedVideos}`);
    console.log(`Stats recorded: ${result.statsRecorded}`);
    console.log(`Tokens refreshed: ${result.tokensRefreshed}`);

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
