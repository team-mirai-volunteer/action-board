import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { formatNumberJa } from "@/lib/utils/format-number-ja";
import type { TikTokVideo, TikTokVideoStats } from "../types";
import { formatDuration, formatTikTokDate } from "../utils/format-utils";
import { TikTokIcon } from "./tiktok-icon";

interface TikTokVideoCardProps {
  video: TikTokVideo & { latest_stats?: TikTokVideoStats };
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
          // biome-ignore lint/performance/noImgElement: TikTokの外部サムネイルURLのためnext/imageは使用不可
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
          {formatTikTokDate(video.published_at)}
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
