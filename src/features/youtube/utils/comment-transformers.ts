import type { RecordedComment } from "../actions/youtube-comment-actions";
import type { DetectedUserComment } from "../services/youtube-comment-service";

/**
 * キャッシュから検出したユーザーコメントに動画情報を付加して、UI表示用の形式に変換する
 */
export function enrichCommentsWithVideoInfo(
  userComments: Array<{
    commentId: string;
    videoId: string;
    textOriginal: string | null;
    publishedAt: string;
  }>,
  videoInfoMap: Map<string, { title: string; videoUrl: string }>,
  recordedCommentIds: Set<string>,
): DetectedUserComment[] {
  return userComments.map((comment) => {
    const videoInfo = videoInfoMap.get(comment.videoId);
    return {
      commentId: comment.commentId,
      videoId: comment.videoId,
      videoTitle: videoInfo?.title || "Unknown",
      videoUrl:
        videoInfo?.videoUrl ||
        `https://www.youtube.com/watch?v=${comment.videoId}`,
      textOriginal: comment.textOriginal,
      publishedAt: comment.publishedAt,
      alreadyRecorded: recordedCommentIds.has(comment.commentId),
    };
  });
}

/**
 * DBから取得したyoutube_user_commentsの行をRecordedComment形式に変換する
 */
export function transformToRecordedComments(
  rows: Array<{
    comment_id: string;
    video_id: string;
    detected_at: string | null;
    youtube_video_comments: {
      text_original: string | null;
      published_at: string;
    };
    youtube_videos: {
      title: string;
      channel_title: string;
      thumbnail_url: string | null;
      published_at: string | null;
    };
  }>,
): RecordedComment[] {
  return rows.map((uc) => {
    const videoComment = uc.youtube_video_comments as {
      text_original: string | null;
      published_at: string;
    };
    const video = uc.youtube_videos as {
      title: string;
      channel_title: string;
      thumbnail_url: string | null;
      published_at: string | null;
    };

    return {
      commentId: uc.comment_id,
      videoId: uc.video_id,
      videoTitle: video.title,
      videoUrl: `https://www.youtube.com/watch?v=${uc.video_id}`,
      thumbnailUrl: video.thumbnail_url,
      channelTitle: video.channel_title,
      textOriginal: videoComment.text_original || "",
      videoPublishedAt: video.published_at,
      commentedAt: videoComment.published_at,
      recordedAt: uc.detected_at || new Date().toISOString(),
    };
  });
}
