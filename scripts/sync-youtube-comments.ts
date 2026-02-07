/**
 * YouTubeコメント同期バッチスクリプト
 * 1. 直近1ヶ月のチームみらい動画のコメントをキャッシュ
 * 2. 全連携ユーザーのコメントを検出し、ミッションクリアとして記録
 *
 * 使用方法:
 *   pnpm youtube:sync-comments         # 実行
 *   pnpm youtube:sync-comments:dry     # ドライラン
 */

import "dotenv/config";

import {
  cacheVideoComments,
  createYouTubeCommentRecord,
  findUserCommentsInCache,
  generateCommentUrl,
  getConnectedUserChannelIds,
  getLastSyncedCommentDate,
  getRecentTeamMiraiVideos,
  getUserRecordedComments,
} from "@/features/youtube/services/sync-comments-core";
import { fetchVideoComments } from "@/features/youtube/services/youtube-client";
import { createAdminClient } from "@/lib/supabase/adminClient";

interface SyncResult {
  totalVideos: number;
  totalCommentsCached: number;
  totalUsersProcessed: number;
  totalAchievements: number;
  totalXpGranted: number;
  errors: string[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    isDryRun: args.includes("--dry-run"),
  };
}

async function main() {
  const options = parseArgs();

  console.log("=== YouTube Comments Sync ===");
  console.log(`Mode: ${options.isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  const result: SyncResult = {
    totalVideos: 0,
    totalCommentsCached: 0,
    totalUsersProcessed: 0,
    totalAchievements: 0,
    totalXpGranted: 0,
    errors: [],
  };

  const adminClient = await createAdminClient();

  // ========================================
  // Phase 1: 動画のコメントをキャッシュ
  // ========================================
  console.log("Phase 1: Caching video comments...");

  // 直近1ヶ月のチームみらい動画を取得
  const recentVideos = await getRecentTeamMiraiVideos();
  result.totalVideos = recentVideos.length;
  console.log(`Found ${recentVideos.length} recent videos (last 1 month)\n`);

  if (options.isDryRun) {
    console.log("[DRY RUN] Would cache comments for videos:");
    for (const video of recentVideos) {
      console.log(`  - ${video.title} (${video.videoId})`);
    }
    console.log("");
  } else {
    for (const video of recentVideos) {
      try {
        console.log(`Syncing comments for: ${video.title}`);

        // 最終同期日時を取得
        const lastSyncedAt = await getLastSyncedCommentDate(video.videoId);
        if (lastSyncedAt) {
          console.log(`  Last synced: ${lastSyncedAt.toISOString()}`);
        }

        // コメントを取得
        const comments = await fetchVideoComments(
          video.videoId,
          500,
          lastSyncedAt || undefined,
        );
        console.log(`  Fetched ${comments.length} comments`);

        if (comments.length > 0) {
          // キャッシュに保存
          const cacheResult = await cacheVideoComments(comments);
          result.totalCommentsCached += cacheResult.cachedCount;
          console.log(`  Cached ${cacheResult.cachedCount} new comments`);
        }
      } catch (error) {
        const errorMsg = `Failed to sync comments for ${video.videoId}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`  Error: ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }
    console.log("");
  }

  // ========================================
  // Phase 2: ユーザーのコメントを検出
  // ========================================
  console.log("Phase 2: Detecting user comments...");

  // YouTube連携ユーザーのチャンネルID一覧を取得
  const channelIdToUserId = await getConnectedUserChannelIds();
  console.log(`Found ${channelIdToUserId.size} YouTube connected users\n`);

  if (channelIdToUserId.size === 0) {
    console.log("No connected users found, skipping achievement processing");
  } else if (options.isDryRun) {
    // ドライラン: ユーザーのコメントを検出して表示
    const videoIds = recentVideos.map((v) => v.videoId);
    const userCommentsMap = await findUserCommentsInCache(
      channelIdToUserId,
      videoIds,
    );

    console.log("[DRY RUN] Would process comments for users:");
    for (const [userId, comments] of Array.from(userCommentsMap.entries())) {
      const recordedComments = await getUserRecordedComments(userId);
      const unrecordedComments = comments.filter(
        (c: { commentId: string }) => !recordedComments.has(c.commentId),
      );
      console.log(
        `  - User ${userId.slice(0, 8)}: ${comments.length} comments (${unrecordedComments.length} new)`,
      );
    }
    console.log("");
  } else {
    // ========================================
    // Phase 3: ミッションクリアを記録
    // ========================================
    console.log("Phase 3: Recording mission achievements...");

    // 動的インポート（server-only対策）
    const { grantMissionCompletionXp } = await import(
      "@/features/user-level/services/level"
    );
    const { getCurrentSeasonId } = await import("@/lib/services/seasons");

    // YouTubeコメントミッションを取得
    const { data: commentMission } = await adminClient
      .from("missions")
      .select("id")
      .eq("slug", "youtube-comment")
      .single();

    if (!commentMission) {
      console.error(
        "YouTube comment mission not found (slug: youtube-comment)",
      );
      result.errors.push("YouTube comment mission not found");
    } else {
      const currentSeasonId = await getCurrentSeasonId();
      const videoIds = recentVideos.map((v) => v.videoId);
      const userCommentsMap = await findUserCommentsInCache(
        channelIdToUserId,
        videoIds,
      );

      for (const [userId, comments] of Array.from(userCommentsMap.entries())) {
        result.totalUsersProcessed++;
        console.log(`Processing user: ${userId.slice(0, 8)}`);

        try {
          // 既に記録済みのコメントを取得
          const recordedComments = await getUserRecordedComments(userId);

          // 未記録のコメントをフィルタ
          const unrecordedComments = comments.filter(
            (c: { commentId: string }) => !recordedComments.has(c.commentId),
          );

          if (unrecordedComments.length === 0) {
            console.log("  No new comments to record");
            continue;
          }

          console.log(`  Found ${unrecordedComments.length} new comments`);

          // 各コメントをミッション達成として記録
          for (const comment of unrecordedComments) {
            try {
              // コメントURLを生成
              const commentUrl = generateCommentUrl(
                comment.videoId,
                comment.commentId,
              );

              // achievements作成
              const { data: achievement, error: achievementError } =
                await adminClient
                  .from("achievements")
                  .insert({
                    user_id: userId,
                    mission_id: commentMission.id,
                    season_id: currentSeasonId,
                  })
                  .select("id")
                  .single();

              if (achievementError) {
                throw new Error(
                  `Failed to create achievement: ${achievementError.message}`,
                );
              }

              // mission_artifacts作成
              const { data: artifact, error: artifactError } = await adminClient
                .from("mission_artifacts")
                .insert({
                  achievement_id: achievement.id,
                  user_id: userId,
                  artifact_type: "YOUTUBE_COMMENT",
                  link_url: commentUrl,
                })
                .select("id")
                .single();

              if (artifactError) {
                throw new Error(
                  `Failed to create artifact: ${artifactError.message}`,
                );
              }

              // youtube_user_comments作成
              const recordResult = await createYouTubeCommentRecord(
                userId,
                comment.videoId,
                comment.commentId,
                artifact.id,
              );

              if (!recordResult.success) {
                throw new Error(
                  `Failed to create comment record: ${recordResult.error}`,
                );
              }

              // XP付与
              const xpResult = await grantMissionCompletionXp(
                userId,
                commentMission.id,
                achievement.id,
              );

              result.totalAchievements++;
              result.totalXpGranted += xpResult.xpGranted || 0;
            } catch (error) {
              const errorMsg = `Failed to record comment ${comment.commentId}: ${error instanceof Error ? error.message : String(error)}`;
              console.error(`    Error: ${errorMsg}`);
              result.errors.push(errorMsg);
            }
          }

          console.log(
            `  Recorded ${unrecordedComments.length} mission achievements`,
          );
        } catch (error) {
          const errorMsg = `Failed to process user ${userId}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`  Error: ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }
    }
  }

  // ========================================
  // Summary
  // ========================================
  console.log("\n=== Sync Complete ===");
  console.log(`Videos processed: ${result.totalVideos}`);
  console.log(`Comments cached: ${result.totalCommentsCached}`);
  console.log(`Users processed: ${result.totalUsersProcessed}`);
  console.log(`Achievements: ${result.totalAchievements}`);
  console.log(`XP granted: ${result.totalXpGranted}`);

  if (result.errors.length > 0) {
    console.log(`\nErrors (${result.errors.length}):`);
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
