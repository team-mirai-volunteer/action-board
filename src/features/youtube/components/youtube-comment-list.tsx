"use client";

import { Loader2, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  getRecordedCommentsAction,
  type RecordedComment,
} from "@/features/youtube/actions/youtube-comment-actions";

interface YouTubeCommentListProps {
  refreshTrigger?: number;
}

export function YouTubeCommentList({
  refreshTrigger = 0,
}: YouTubeCommentListProps) {
  const [comments, setComments] = useState<RecordedComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTriggerの変更時のみ再フェッチする意図的な設計
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getRecordedCommentsAction();
        if (result.success && result.comments) {
          setComments(result.comments);
        } else {
          setError(result.error || "コメント一覧の取得に失敗しました");
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("コメント一覧の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          まだコメントを記録した動画がありません
        </p>
        <p className="text-xs text-gray-400 mt-1">
          YouTubeでチームみらい動画にコメントして、同期ボタンで記録しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        {comments.length}件のコメントを記録しました
        {comments.length >= 100 && "（最新100件を表示）"}
      </p>
      <div className="flex flex-col divide-y max-h-[70vh] overflow-y-auto">
        {comments.map((comment) => (
          <a
            key={comment.commentId}
            href={comment.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-2 hover:bg-gray-50 transition-colors"
          >
            {/* サムネイル */}
            <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
              {comment.thumbnailUrl ? (
                <Image
                  src={comment.thumbnailUrl}
                  alt={comment.videoTitle}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  No img
                </div>
              )}
            </div>

            {/* コンテンツ */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-1 hover:text-teal-600 transition-colors">
                {comment.videoTitle}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                💬 {comment.textOriginal}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {comment.videoPublishedAt && (
                  <>
                    動画公開日:{" "}
                    {new Date(comment.videoPublishedAt).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                    {" / "}
                  </>
                )}
                コメント同期日:{" "}
                {new Date(comment.recordedAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
