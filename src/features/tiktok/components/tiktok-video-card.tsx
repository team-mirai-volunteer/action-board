import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import type { TikTokVideo, TikTokVideoStats } from "../types";

interface TikTokVideoCardProps {
  video: TikTokVideo & { latest_stats?: TikTokVideoStats };
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumberJa(num: number | null): string {
  if (num === null) return "-";

  const absNum = Math.abs(num);

  if (absNum >= 100_000_000) {
    const value = num / 100_000_000;
    return value % 1 === 0 ? `${value}億` : `${value.toFixed(1)}億`;
  }

  if (absNum >= 10_000) {
    const value = num / 10_000;
    return value % 1 === 0 ? `${value}万` : `${value.toFixed(1)}万`;
  }

  return num.toLocaleString();
}

export function TikTokVideoCard({ video }: TikTokVideoCardProps) {
  const stats = video.latest_stats;

  return (
    <Link
      href={video.video_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      {/* サムネイル（縦長） */}
      <div className="relative w-10 h-15 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title || "TikTok動画"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            <TikTokIcon className="w-6 h-6" />
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
          {video.title || video.description || "無題"}
        </h3>

        {/* クリエイター名・日付 */}
        <p className="text-xs text-gray-500 truncate">
          {video.creator_username ? `@${video.creator_username}` : "TikTok"} •{" "}
          {formatDate(video.published_at)}
        </p>

        {/* 統計 */}
        {stats && (
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
            {stats.view_count !== null && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatNumberJa(stats.view_count)}</span>
              </span>
            )}
            {stats.like_count !== null && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{formatNumberJa(stats.like_count)}</span>
              </span>
            )}
            {stats.comment_count !== null && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{formatNumberJa(stats.comment_count)}</span>
              </span>
            )}
            {stats.share_count !== null && (
              <span className="flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                <span>{formatNumberJa(stats.share_count)}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}
