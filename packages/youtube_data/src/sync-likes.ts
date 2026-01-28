import "dotenv/config";
import {
  fetchAllYouTubeConnections,
  fetchTeamMiraiVideoIds,
  fetchUserLikedVideoIds,
  getCurrentSeasonId,
  getYouTubeLikeMissionId,
  recordYouTubeLikeAchievement,
  updateUserAccessToken,
} from "./likes-db.js";
import { getSupabaseClient } from "./supabase.js";
import {
  fetchUserLikedVideos,
  refreshAccessToken,
} from "./youtube-oauth-client.js";

// #チームみらい を検出する正規表現
const TEAM_MIRAI_REGEX = /#(チームみらい|teammirai)/i;

interface LikeSyncResult {
  processedUsers: number;
  newAchievements: number;
  skippedAlreadyAchieved: number;
  skippedNotTeamMirai: number;
  errors: string[];
}

// CLIオプションのパース
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    isDryRun: args.includes("--dry-run"),
  };
}

const options = parseArgs();

/**
 * 動画がチームみらい関連かどうかを判定
 */
function isTeamMiraiVideo(video: {
  snippet: {
    title: string;
    description: string;
    tags?: string[];
  };
}): boolean {
  const description = video.snippet.description || "";
  const title = video.snippet.title || "";
  const tags = video.snippet.tags || [];

  return (
    TEAM_MIRAI_REGEX.test(description) ||
    TEAM_MIRAI_REGEX.test(title) ||
    tags.some((tag) => TEAM_MIRAI_REGEX.test(tag))
  );
}

async function syncYouTubeLikes(): Promise<LikeSyncResult> {
  const result: LikeSyncResult = {
    processedUsers: 0,
    newAchievements: 0,
    skippedAlreadyAchieved: 0,
    skippedNotTeamMirai: 0,
    errors: [],
  };

  console.log("=== YouTube Likes Sync ===");
  console.log(`Mode: ${options.isDryRun ? "DRY RUN" : "LIVE"}`);

  const supabase = getSupabaseClient();

  // 1. YouTubeいいねミッションのIDを取得
  const missionId = await getYouTubeLikeMissionId(supabase);
  if (!missionId) {
    console.error(
      "YouTube like mission not found. Ensure 'youtube-like' mission exists.",
    );
    result.errors.push("Mission not found");
    return result;
  }
  console.log(`Mission ID: ${missionId}`);

  // 2. 現在のシーズンIDを取得
  const seasonId = await getCurrentSeasonId(supabase);
  console.log(`Season ID: ${seasonId || "none"}`);

  // 3. チームみらい動画のvideo_id一覧を取得
  const teamMiraiVideos = await fetchTeamMiraiVideoIds(supabase);
  console.log(`Team Mirai videos in DB: ${teamMiraiVideos.size}`);

  // 4. YouTube連携ユーザーを取得
  const connections = await fetchAllYouTubeConnections(supabase);
  console.log(`YouTube connected users: ${connections.length}`);

  if (options.isDryRun) {
    console.log("\n[DRY RUN] Would process users:");
  }

  // 5. 各ユーザーのいいねを同期
  for (const connection of connections) {
    result.processedUsers++;

    try {
      // トークンの有効期限をチェック
      let accessToken = connection.access_token;
      const tokenExpiresAt = new Date(connection.token_expires_at);
      const now = new Date();

      // 有効期限の5分前を閾値とする
      if (tokenExpiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        try {
          console.log(`  Refreshing token for user ${connection.user_id}...`);
          const tokens = await refreshAccessToken(connection.refresh_token);
          accessToken = tokens.access_token;

          if (!options.isDryRun) {
            await updateUserAccessToken(
              supabase,
              connection.user_id,
              tokens.access_token,
              tokens.refresh_token || connection.refresh_token,
              new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            );
          }
        } catch (refreshError) {
          result.errors.push(
            `Token refresh failed for user ${connection.user_id}: ${refreshError instanceof Error ? refreshError.message : String(refreshError)}`,
          );
          continue;
        }
      }

      // ユーザーの既存いいね動画を取得
      const existingLikes = await fetchUserLikedVideoIds(
        supabase,
        connection.user_id,
      );

      // YouTube APIでいいね動画を取得
      const likedVideos = await fetchUserLikedVideos(accessToken, 100);

      let userNewAchievements = 0;
      let userSkippedAlreadyAchieved = 0;
      let userSkippedNotTeamMirai = 0;

      for (const video of likedVideos) {
        // 既に達成済みかチェック
        if (existingLikes.has(video.id)) {
          userSkippedAlreadyAchieved++;
          result.skippedAlreadyAchieved++;
          continue;
        }

        // チームみらい動画か判定
        // 1. DBに登録済みの動画
        const youtubeVideoId = teamMiraiVideos.get(video.id);
        // 2. または#チームみらいタグを含む動画
        const hasTeamMiraiTag = isTeamMiraiVideo(video);

        if (!youtubeVideoId && !hasTeamMiraiTag) {
          userSkippedNotTeamMirai++;
          result.skippedNotTeamMirai++;
          continue;
        }

        if (options.isDryRun) {
          console.log(`    Would achieve: ${video.snippet.title}`);
          userNewAchievements++;
          result.newAchievements++;
          continue;
        }

        // 達成を記録
        const success = await recordYouTubeLikeAchievement(
          supabase,
          connection.user_id,
          missionId,
          seasonId,
          video.id,
          youtubeVideoId || null,
        );

        if (success) {
          userNewAchievements++;
          result.newAchievements++;
          console.log(`    Achieved: ${video.snippet.title}`);
        }
      }

      console.log(
        `  User ${connection.user_id}: +${userNewAchievements} new, ${userSkippedAlreadyAchieved} already, ${userSkippedNotTeamMirai} not team mirai`,
      );
    } catch (error) {
      result.errors.push(
        `Error processing user ${connection.user_id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  return result;
}

async function main() {
  try {
    const result = await syncYouTubeLikes();

    console.log("\n=== Sync Complete ===");
    console.log(`Processed users: ${result.processedUsers}`);
    console.log(`New achievements: ${result.newAchievements}`);
    console.log(`Skipped (already achieved): ${result.skippedAlreadyAchieved}`);
    console.log(`Skipped (not team mirai): ${result.skippedNotTeamMirai}`);

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
