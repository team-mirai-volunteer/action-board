import Link from "next/link";
import { formatNumber } from "@/lib/utils/metrics-formatter";

interface VideoMetricProps {
  totalViews: number;
  totalVideos: number;
  dailyViewsIncrease?: number;
  dailyVideosIncrease?: number;
  startDate?: Date;
}

/**
 * 日付を YYYY.MM.DD 形式でフォーマット
 */
function formatDateLabel(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/**
 * 動画統計表示コンポーネント（YouTube + TikTok合算）
 */
export function VideoMetric({
  totalViews,
  totalVideos,
  dailyViewsIncrease = 0,
  dailyVideosIncrease = 0,
  startDate,
}: VideoMetricProps) {
  const dateLabel = startDate ? `${formatDateLabel(startDate)}-` : "";
  return (
    <div className="py-3">
      {/* 再生回数 */}
      <div className="flex justify-between">
        <div>
          <p className="text-base text-black mt-1">動画再生回数</p>
          <p className="text-xs text-gray-500">
            {dateLabel && ` ${dateLabel}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-800">
            {formatNumber(totalViews)}
            <span className="text-lg">回</span>
          </p>
          <p className="text-xs text-gray-600">
            1日で{" "}
            <span className="font-bold text-teal-700">
              +{formatNumber(dailyViewsIncrease)}回
            </span>
          </p>
        </div>
      </div>

      {/* 動画本数 */}
      <div className="flex justify-between mt-4">
        <div>
          <p className="text-base text-black mt-1">動画本数</p>
          <p className="text-xs text-gray-500">
            {dateLabel && ` ${dateLabel}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-800">
            {formatNumber(totalVideos)}
            <span className="text-lg">本</span>
          </p>
          <p className="text-xs text-gray-600">
            1日で{" "}
            <span className="font-bold text-teal-700">
              +{formatNumber(dailyVideosIncrease)}本
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 text-end flex flex-col items-end gap-3">
        <Link
          href="/youtube_stats"
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm transition-colors"
        >
          <span>YouTubeダッシュボード</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>YouTube詳細</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
        <Link
          href="/tiktok_stats"
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm transition-colors"
        >
          <span>TikTokダッシュボード</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>TikTok詳細</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
