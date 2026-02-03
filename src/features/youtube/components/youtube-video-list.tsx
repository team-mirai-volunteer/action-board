"use client";

import { useEffect, useState } from "react";
import { YouTubeVideoCard } from "@/features/youtube-stats/components/youtube-video-card";
import type { YouTubeVideoWithStats } from "@/features/youtube-stats/types";
import { getMyUploadedVideosAction } from "../actions/youtube-video-actions";

interface YouTubeVideoListProps {
  initialVideos?: YouTubeVideoWithStats[];
  refreshTrigger?: number;
}

export function YouTubeVideoList({
  initialVideos,
  refreshTrigger,
}: YouTubeVideoListProps) {
  const [videos, setVideos] = useState<YouTubeVideoWithStats[]>(
    initialVideos || [],
  );
  const [isLoading, setIsLoading] = useState(!initialVideos);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is intentionally used to trigger refetch
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getMyUploadedVideosAction();
        if (result.success && result.videos) {
          setVideos(result.videos);
        } else {
          setError(result.error || "動画の取得に失敗しました");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "動画の取得に失敗しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        #チームみらい 動画がまだ同期されていない、もしくは存在しません。
        <br />
        動画は毎日自動的に同期されます。
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {videos.map((video) => (
        <YouTubeVideoCard key={video.video_id} video={video} />
      ))}
    </div>
  );
}
