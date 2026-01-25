"use client";

import { useEffect, useState } from "react";
import { getMyTikTokVideosAction } from "../actions/tiktok-video-actions";
import type { TikTokVideo, TikTokVideoStats } from "../types";
import { TikTokVideoCard } from "./tiktok-video-card";

interface TikTokVideoListProps {
  initialVideos?: (TikTokVideo & { latest_stats?: TikTokVideoStats })[];
  refreshTrigger?: number;
}

export function TikTokVideoList({
  initialVideos,
  refreshTrigger,
}: TikTokVideoListProps) {
  const [videos, setVideos] = useState<
    (TikTokVideo & { latest_stats?: TikTokVideoStats })[]
  >(initialVideos || []);
  const [isLoading, setIsLoading] = useState(!initialVideos);
  const [error, setError] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is intentionally used to trigger refetch
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getMyTikTokVideosAction();
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
        「動画を同期」ボタンを押して、TikTokから動画を取得してください。
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {videos.map((video) => (
        <TikTokVideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
