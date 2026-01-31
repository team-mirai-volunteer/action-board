import "server-only";

import { type CommentThread, fetchVideoComments } from "./youtube-client";

// sync-comments-core.tsからの再エクスポート
// バッチとServer Action両方で同じロジックを使用
export {
  type CachedComment,
  cacheVideoComments,
  createYouTubeCommentRecord,
  findUserCommentsInCache,
  generateCommentUrl,
  getConnectedUserChannelIds,
  getLastSyncedCommentDate,
  getRecentTeamMiraiVideos,
  getUserRecordedComments,
  syncVideoComments,
} from "./sync-comments-core";

import { createClient } from "@/lib/supabase/client";

/**
 * 検出されたユーザーコメント（UI表示用に拡張）
 */
export interface DetectedUserComment {
  commentId: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  textOriginal: string | null;
  publishedAt: string;
  alreadyRecorded: boolean;
}

/**
 * コメント同期結果
 */
export interface CommentSyncResult {
  syncedCommentCount: number;
  achievedCount: number;
  totalXpGranted: number;
  errors: string[];
}

/**
 * 動画情報を取得する（コメントURLの生成用）
 * @param videoIds 動画IDの配列
 */
export async function getVideoInfoMap(
  videoIds: string[],
): Promise<Map<string, { title: string; videoUrl: string }>> {
  if (videoIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();

  const { data: videos, error } = await supabase
    .from("youtube_videos")
    .select("video_id, title, video_url")
    .in("video_id", videoIds);

  if (error) {
    console.error("Failed to fetch video info:", error);
    return new Map();
  }

  return new Map(
    (videos || []).map((v) => [
      v.video_id,
      {
        title: v.title,
        videoUrl:
          v.video_url || `https://www.youtube.com/watch?v=${v.video_id}`,
      },
    ]),
  );
}

// CommentThread型の再エクスポート
export type { CommentThread };
export { fetchVideoComments };
