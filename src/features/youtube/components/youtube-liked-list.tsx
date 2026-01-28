"use client";

import {
  type RecordedLike,
  getRecordedLikesAction,
} from "@/features/youtube/actions/youtube-like-actions";
import { ExternalLink, Loader2, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
      </p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {likes.map((like) => (
          <a
            key={like.videoId}
            href={like.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {like.thumbnailUrl ? (
              <Image
                src={like.thumbnailUrl}
                alt={like.title}
                width={80}
                height={45}
                className="rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-11 bg-gray-200 rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {like.title}
              </p>
              <p className="text-xs text-gray-500">
                記録日: {new Date(like.recordedAt).toLocaleDateString("ja-JP")}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
