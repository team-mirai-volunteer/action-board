/**
 * YouTubeコメント同期のコアロジック
 * Server Actionとバッチスクリプトのどちらからでもimportできるよう、"server-only"を付けない
 */

import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  buildCommentCacheRecord,
  type CachedComment,
  groupCommentsByUser,
} from "../utils/sync-helpers";
import { type CommentThread, fetchVideoComments } from "./youtube-client";

export type { CachedComment };

/**
 * 直近1ヶ月以内に公開されたチームみらい動画を取得する
 */
export async function getRecentTeamMiraiVideos(): Promise<
  { videoId: string; videoUrl: string; title: string; publishedAt: string }[]
> {
  const adminClient = await createAdminClient();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const { data: videos, error } = await adminClient
    .from("youtube_videos")
    .select("video_id, video_url, title, published_at")
    .eq("is_active", true)
    .gte("published_at", oneMonthAgo.toISOString())
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch recent videos:", error);
    return [];
  }

  return (videos || []).map((v) => ({
    videoId: v.video_id,
    videoUrl: v.video_url || `https://www.youtube.com/watch?v=${v.video_id}`,
    title: v.title,
    publishedAt: v.published_at || "",
  }));
}

/**
 * 動画の最終同期日時を取得する（差分同期用）
 * @param videoId YouTube動画ID
 */
export async function getLastSyncedCommentDate(
  videoId: string,
): Promise<Date | null> {
  const adminClient = await createAdminClient();

  const { data, error } = await adminClient
    .from("youtube_video_comments")
    .select("published_at")
    .eq("video_id", videoId)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return new Date(data.published_at);
}

/**
 * コメントをキャッシュに保存する（upsert）
 * @param comments コメントスレッドの配列
 */
export async function cacheVideoComments(
  comments: CommentThread[],
): Promise<{ success: boolean; cachedCount: number }> {
  if (comments.length === 0) {
    return { success: true, cachedCount: 0 };
  }

  const adminClient = await createAdminClient();

  const records = comments.map(buildCommentCacheRecord);

  const { error } = await adminClient
    .from("youtube_video_comments")
    .upsert(records, {
      onConflict: "comment_id",
      ignoreDuplicates: true,
    });

  if (error) {
    console.error("Failed to cache comments:", error);
    return { success: false, cachedCount: 0 };
  }

  return { success: true, cachedCount: records.length };
}

/**
 * 動画のコメントを取得してキャッシュに保存する
 * @param videoId YouTube動画ID
 * @param maxResults 取得する最大件数
 * @returns success, newCommentsCount, skipped（2時間以内に同期済みの場合true）
 */
export async function syncVideoComments(
  videoId: string,
  maxResults = 500,
): Promise<{ success: boolean; newCommentsCount: number; skipped?: boolean }> {
  const adminClient = await createAdminClient();

  // 2時間のレート制限チェック
  const { data: video } = await adminClient
    .from("youtube_videos")
    .select("comments_synced_at")
    .eq("video_id", videoId)
    .single();

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const lastSyncedAt = video?.comments_synced_at
    ? new Date(video.comments_synced_at)
    : null;

  if (lastSyncedAt && lastSyncedAt > twoHoursAgo) {
    // 2時間以内に同期済み → スキップ
    return { success: true, newCommentsCount: 0, skipped: true };
  }

  // 最終コメント日時を取得（差分同期用）
  const lastCommentAt = await getLastSyncedCommentDate(videoId);

  // コメントを取得
  const comments = await fetchVideoComments(
    videoId,
    maxResults,
    lastCommentAt || undefined,
  );

  if (comments.length === 0) {
    // API呼び出しはしたので comments_synced_at を更新
    await adminClient
      .from("youtube_videos")
      .update({ comments_synced_at: new Date().toISOString() })
      .eq("video_id", videoId);

    return { success: true, newCommentsCount: 0 };
  }

  // キャッシュに保存
  const result = await cacheVideoComments(comments);

  // comments_synced_at を更新
  await adminClient
    .from("youtube_videos")
    .update({ comments_synced_at: new Date().toISOString() })
    .eq("video_id", videoId);

  return { success: result.success, newCommentsCount: result.cachedCount };
}

/**
 * YouTube連携ユーザーのチャンネルID一覧を取得する
 */
export async function getConnectedUserChannelIds(): Promise<
  Map<string, string>
> {
  const adminClient = await createAdminClient();

  const { data: connections, error } = await adminClient
    .from("youtube_user_connections")
    .select("user_id, channel_id");

  if (error) {
    console.error("Failed to fetch user connections:", error);
    return new Map();
  }

  return new Map((connections || []).map((c) => [c.channel_id, c.user_id]));
}

/**
 * キャッシュ内のコメントから連携ユーザーのコメントを検索する
 * @param channelIdToUserId チャンネルID→ユーザーIDのマップ
 * @param videoIds 対象の動画ID（省略時は全キャッシュ）
 */
export async function findUserCommentsInCache(
  channelIdToUserId: Map<string, string>,
  videoIds?: string[],
): Promise<Map<string, CachedComment[]>> {
  const adminClient = await createAdminClient();

  const channelIds = Array.from(channelIdToUserId.keys());

  if (channelIds.length === 0) {
    return new Map();
  }

  let query = adminClient
    .from("youtube_video_comments")
    .select("*")
    .in("author_channel_id", channelIds);

  if (videoIds && videoIds.length > 0) {
    query = query.in("video_id", videoIds);
  }

  const { data: comments, error } = await query;

  if (error) {
    console.error("Failed to find user comments:", error);
    return new Map();
  }

  // ユーザーIDごとにコメントをグループ化
  return groupCommentsByUser(comments || [], channelIdToUserId);
}

/**
 * ユーザーが既に記録済みのコメントIDセットを取得する
 * @param userId ユーザーID
 */
export async function getUserRecordedComments(
  userId: string,
): Promise<Set<string>> {
  const adminClient = await createAdminClient();

  const { data: comments } = await adminClient
    .from("youtube_user_comments")
    .select("comment_id")
    .eq("user_id", userId);

  return new Set((comments || []).map((c) => c.comment_id));
}

/**
 * YouTubeコメント記録を作成する
 * @param userId ユーザーID
 * @param videoId YouTube動画ID
 * @param commentId YouTubeコメントID
 * @param missionArtifactId 関連する成果物ID
 */
export async function createYouTubeCommentRecord(
  userId: string,
  videoId: string,
  commentId: string,
  missionArtifactId: string,
): Promise<{ success: boolean; error?: string }> {
  const adminClient = await createAdminClient();

  const { error } = await adminClient.from("youtube_user_comments").insert({
    user_id: userId,
    video_id: videoId,
    comment_id: commentId,
    mission_artifact_id: missionArtifactId,
  });

  if (error) {
    // 重複エラーの場合は成功として扱う
    if (error.code === "23505") {
      return { success: true };
    }
    console.error("Failed to create YouTube comment record:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// URL ユーティリティを再エクスポート
export {
  extractCommentIdFromUrl,
  generateCommentUrl,
} from "../utils/url-utils";
