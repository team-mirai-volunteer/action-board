import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  formatDateShort,
  formatIsoDuration,
} from "@/lib/utils/date-formatters";
import type { YouTubeVideoWithStats } from "../types";
import { formatNumberJa } from "../utils/format";

interface YouTubeVideoCardProps {
  video: YouTubeVideoWithStats;
}

export function YouTubeVideoCard({ video }: YouTubeVideoCardProps) {
  return (
    <Link
      href={video.video_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-2 bg-white hover:bg-gray-50 transition-colors"
    >
      {/* サムネイル */}
      <div className="relative w-24 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            No img
          </div>
        )}
        {/* 再生時間 */}
        {video.duration && (
          <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[10px] px-1 rounded">
            {formatIsoDuration(video.duration)}
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* タイトル */}
        <h3 className="font-medium text-sm line-clamp-1 hover:text-teal-600 transition-colors">
          {video.title}
        </h3>

        {/* チャンネル名・日付 */}
        <p className="text-xs text-gray-500 truncate">
          {video.channel_title} • {formatDateShort(video.published_at)}
        </p>

        {/* 統計 */}
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumberJa(video.latest_view_count)}</span>
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            <span>{formatNumberJa(video.latest_like_count)}</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{formatNumberJa(video.latest_comment_count)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
