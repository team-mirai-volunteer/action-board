import type { CommentThread, LikedVideoItem } from "../services/youtube-client";

/**
 * キャッシュされたコメント情報
 */
export interface CachedComment {
  commentId: string;
  videoId: string;
  authorChannelId: string;
  authorDisplayName: string | null;
  textDisplay: string | null;
  textOriginal: string | null;
  publishedAt: string;
}

/**
 * YouTube APIのいいね動画アイテムをアプリ内の LikedVideo 形式にマッピングする
 */
export function mapLikedVideoItem(item: LikedVideoItem): {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl?: string;
  publishedAt: string;
} {
  return {
    videoId: item.id,
    title: item.snippet.title,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    thumbnailUrl:
      item.snippet.thumbnails.medium?.url ||
      item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
  };
}

/**
 * YouTube APIの動画詳細からDB保存用のいいね動画レコードを構築する
 */
export function buildLikeVideoRecord(detail: {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails: {
      medium?: { url: string };
      default?: { url: string };
    };
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
  };
}) {
  return {
    video_id: detail.id,
    video_url: `https://www.youtube.com/watch?v=${detail.id}`,
    title: detail.snippet.title,
    description: detail.snippet.description || null,
    thumbnail_url:
      detail.snippet.thumbnails.medium?.url ||
      detail.snippet.thumbnails.default?.url ||
      null,
    channel_id: detail.snippet.channelId,
    channel_title: detail.snippet.channelTitle,
    published_at: detail.snippet.publishedAt,
    tags: detail.snippet.tags || [],
    is_active: true,
  };
}

/**
 * 全IDリストから既存IDセットに含まれないIDをフィルタする
 */
export function filterNewIds(
  allIds: string[],
  existingIds: Set<string>,
): string[] {
  return allIds.filter((id) => !existingIds.has(id));
}

/**
 * CommentThread をDBキャッシュ保存用のレコードに変換する
 */
export function buildCommentCacheRecord(comment: CommentThread) {
  return {
    video_id: comment.snippet.videoId,
    comment_id: comment.snippet.topLevelComment.id,
    author_channel_id:
      comment.snippet.topLevelComment.snippet.authorChannelId.value,
    author_display_name:
      comment.snippet.topLevelComment.snippet.authorDisplayName,
    text_display: comment.snippet.topLevelComment.snippet.textDisplay,
    text_original: comment.snippet.topLevelComment.snippet.textOriginal,
    published_at: comment.snippet.topLevelComment.snippet.publishedAt,
  };
}

/**
 * コメント配列をchannelIdToUserIdマップを使ってユーザーIDごとにグループ化する
 */
export function groupCommentsByUser(
  comments: Array<{
    comment_id: string;
    video_id: string;
    author_channel_id: string;
    author_display_name: string | null;
    text_display: string | null;
    text_original: string | null;
    published_at: string;
  }>,
  channelIdToUserId: Map<string, string>,
): Map<string, CachedComment[]> {
  const result = new Map<string, CachedComment[]>();

  for (const comment of comments) {
    const userId = channelIdToUserId.get(comment.author_channel_id);
    if (!userId) continue;

    const cachedComment: CachedComment = {
      commentId: comment.comment_id,
      videoId: comment.video_id,
      authorChannelId: comment.author_channel_id,
      authorDisplayName: comment.author_display_name,
      textDisplay: comment.text_display,
      textOriginal: comment.text_original,
      publishedAt: comment.published_at,
    };

    const userComments = result.get(userId) || [];
    userComments.push(cachedComment);
    result.set(userId, userComments);
  }

  return result;
}
