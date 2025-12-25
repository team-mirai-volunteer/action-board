import type { SupporterData } from "@/features/metrics/types/metrics-types";
import { formatNumber } from "@/lib/utils/metrics-formatter";

interface SupporterMetricProps {
  data: SupporterData | null;
  fallbackCount?: number;
  fallbackIncrease?: number;
}

/**
 * サポーター数表示コンポーネント
 *
 * チームはやまのサポーター数とその増加数を表示します。
 * 外部APIからのデータが取得できない場合は、環境変数のフォールバック値を使用します。
 */
export function SupporterMetric({
  data,
  fallbackCount = 0,
  fallbackIncrease = 0,
}: SupporterMetricProps) {
  const supporterCount = data?.totalCount ?? fallbackCount;
  const supporterIncrease = data?.last24hCount ?? fallbackIncrease;

  return (
    <div className="flex items-center justify-between py-6">
      <div>
        <p className="text-base text-black">サポーター数</p>
      </div>
      <div className="text-right">
        {/* 総サポーター数（大きく表示） */}
        <p className="text-2xl font-black text-gray-800">
          {formatNumber(supporterCount)}
          <span className="text-lg">人</span>
        </p>
        {/* 24時間の増加数 */}
        <p className="text-xs text-gray-600">
          1日で{" "}
          <span className="font-bold text-teal-700">
            +{formatNumber(supporterIncrease)}人
          </span>
        </p>
      </div>
    </div>
  );
}
