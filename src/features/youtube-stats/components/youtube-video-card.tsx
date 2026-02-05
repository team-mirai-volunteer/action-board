import { Eye, MessageCircle, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { YouTubeVideoWithStats } from "../types";
import { formatNumberJa } from "../utils/format";

interface YouTubeVideoCardProps {
  video: YouTubeVideoWithStats;
}

function formatDuration(duration: string | null): string {
  if (!duration) return "";

  // ISO 8601 duration format (PT1H2M3S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
            {formatDuration(video.duration)}
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
          {video.channel_title} • {formatDate(video.published_at)}
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
