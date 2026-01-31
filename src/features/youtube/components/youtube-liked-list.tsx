"use client";

import { Loader2, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  getRecordedLikesAction,
  type RecordedLike,
} from "@/features/youtube/actions/youtube-like-actions";

interface YouTubeLikedListProps {
  refreshTrigger?: number;
}

export function YouTubeLikedList({
  refreshTrigger = 0,
}: YouTubeLikedListProps) {
  const [likes, setLikes] = useState<RecordedLike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const fetchLikes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getRecordedLikesAction();
        if (result.success && result.likes) {
          setLikes(result.likes);
        } else {
          setError(result.error || "いいね一覧の取得に失敗しました");
        }
      } catch (err) {
        console.error("Failed to fetch likes:", err);
        setError("いいね一覧の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikes();
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

  if (likes.length === 0) {
    return (
      <div className="text-center py-8">
        <ThumbsUp className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500">
          まだいいねを記録した動画がありません
        </p>
        <p className="text-xs text-gray-400 mt-1">
          YouTubeでチームみらい動画にいいねをして、ミッションページで記録しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        {likes.length}件のいいねを記録しました
        {likes.length >= 100 && "（最新100件を表示）"}
      </p>
      <div className="flex flex-col divide-y max-h-[70vh] overflow-y-auto">
        {likes.map((like) => (
          <a
            key={like.videoId}
            href={like.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-2 hover:bg-gray-50 transition-colors"
          >
            {/* サムネイル */}
            <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
              {like.thumbnailUrl ? (
                <Image
                  src={like.thumbnailUrl}
                  alt={like.title}
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
                {like.title}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {like.channelTitle}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {like.publishedAt && (
                  <>
                    動画公開日:{" "}
                    {new Date(like.publishedAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {" / "}
                  </>
                )}
                いいね同期日:{" "}
                {new Date(like.recordedAt).toLocaleDateString("ja-JP", {
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
