import type { AchievementData } from "@/features/metrics/types/metrics-types";
import { formatNumber } from "@/lib/utils/metrics-formatter";
import Link from "next/link";

interface AchievementMetricProps {
  data: AchievementData | null;
  fallbackTotal?: number;
  fallbackToday?: number;
}

/**
 * アクション達成数表示コンポーネント
 *
 * チームみらいのアクション達成数とその増加数を表示します。
 * Supabaseからのデータが取得できない場合は、環境変数のフォールバック値を使用します。
 */
export function AchievementMetric({
  data,
  fallbackTotal = 0,
  fallbackToday = 0,
}: AchievementMetricProps) {
  const achievementCount = data?.totalCount ?? fallbackTotal;
  const todayAchievementCount = data?.todayCount ?? fallbackToday;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-black">達成アクション数</p>
        </div>
        <div className="text-right">
          {/* 総アクション数（Supabaseから取得、失敗時は環境変数フォールバック） */}
          <p className="text-2xl font-black text-gray-800">
            {formatNumber(achievementCount)}
            <span className="text-lg">件</span>
          </p>
          {/* 24時間のアクション増加数 */}
          <p className="text-xs text-gray-600">
            1日で{" "}
            <span className="font-bold text-teal-700">
              +{formatNumber(todayAchievementCount)}件
            </span>
          </p>
        </div>
      </div>
      <div className="mt-3 text-end">
        <Link
          href="/stats"
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm transition-colors"
        >
          <span>詳しく見る</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>詳しく見る</title>
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
