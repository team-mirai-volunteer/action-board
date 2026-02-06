"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPaginationUrl } from "@/lib/utils/pagination-utils";
import type { TikTokVideoWithStats } from "../types";
import { TikTokVideoCard } from "./tiktok-video-card";

interface TikTokVideoListProps {
  videos: TikTokVideoWithStats[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function TikTokVideoList({
  videos,
  totalCount,
  currentPage,
  pageSize,
}: TikTokVideoListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const createPageUrl = (page: number) =>
    createPaginationUrl(pathname, searchParams, page);

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
          <TikTokVideoCard key={video.id} video={video} />
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
