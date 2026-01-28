"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { YouTubeVideoWithStats } from "../types";
import { YouTubeVideoCard } from "./youtube-video-card";

interface YouTubeVideoListProps {
  videos: YouTubeVideoWithStats[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function YouTubeVideoList({
  videos,
  totalCount,
  currentPage,
  pageSize,
}: YouTubeVideoListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const query = params.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        動画が見つかりませんでした
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* リストレイアウト */}
      <div className="flex flex-col divide-y">
        {videos.map((video) => (
          <YouTubeVideoCard key={video.video_id} video={video} />
        ))}
      </div>

      {/* ページネーション */}
      <div className="flex justify-center items-center gap-4">
        {hasPrevPage ? (
          <Button variant="outline" asChild>
            <Link href={createPageUrl(currentPage - 1)}>前へ</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            前へ
          </Button>
        )}

        <span className="text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>

        {hasNextPage ? (
          <Button variant="outline" asChild>
            <Link href={createPageUrl(currentPage + 1)}>次へ</Link>
          </Button>
        ) : (
          <Button variant="outline" disabled>
            次へ
          </Button>
        )}
      </div>
    </div>
  );
}
