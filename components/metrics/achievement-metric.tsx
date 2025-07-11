import type { AchievementData } from "@/lib/types/metrics";
import { formatNumber } from "@/lib/utils/metrics-formatter";

interface AchievementMetricProps {
  data: AchievementData;
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
  const achievementCount = data.totalCount ?? fallbackTotal;
  const todayAchievementCount = data.todayCount ?? fallbackToday;

  return (
    <div className="flex-1 text-center flex flex-col justify-center">
      <p className="text-sm font-bold text-black mb-2">達成済アクション数</p>
      {/* 総アクション数（Supabaseから取得、失敗時は環境変数フォールバック） */}
      <p className="text-2xl font-black text-black mb-1">
        {formatNumber(achievementCount)}
        <span className="text-lg">件</span>
      </p>
      {/* 24時間のアクション増加数 */}
      <p className="text-xs text-black">
        1日で{" "}
        <span className="font-bold text-teal-700">
          +{formatNumber(todayAchievementCount)}
          <span className="text-xs">件</span>
        </span>
      </p>
    </div>
  );
}
