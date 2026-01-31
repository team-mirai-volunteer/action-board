"use server";

import { syncYouTubeCommentsAction } from "./youtube-comment-actions";
import {
  type SyncLikesResult,
  syncYouTubeLikesAction,
} from "./youtube-like-actions";

/**
 * コメント同期結果
 */
export interface SyncCommentsResult {
  success: boolean;
  syncedCommentCount: number;
  achievedCount: number;
  totalXpGranted: number;
  error?: string;
}

/**
 * 統合同期結果
 */
export interface SyncAllResult {
  success: boolean;
  likes: SyncLikesResult;
  comments: SyncCommentsResult;
  totalXpGranted: number;
  error?: string;
}

/**
 * YouTube全データを同期するServer Action
 * いいね + コメントを一括同期し、ミッションを自動クリアする
 * YouTube設定ページの同期ボタンから呼び出される
 */
export async function syncAllYouTubeDataAction(): Promise<SyncAllResult> {
  // いいねとコメントを並列で同期
  const [likesResult, commentsResult] = await Promise.all([
    syncYouTubeLikesAction(),
    syncYouTubeCommentsAction(),
  ]);

  const success = likesResult.success && commentsResult.success;
  const totalXpGranted =
    likesResult.totalXpGranted + commentsResult.totalXpGranted;

  return {
    success,
    likes: likesResult,
    comments: commentsResult,
    totalXpGranted,
    error: success
      ? undefined
      : [likesResult.error, commentsResult.error].filter(Boolean).join("; "),
  };
}
