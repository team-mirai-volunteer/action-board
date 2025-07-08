import type { SupporterData } from "@/lib/types/metrics";
import { formatNumber } from "@/lib/utils/metrics-formatter";

interface SupporterMetricProps {
  data: SupporterData | null;
  fallbackCount?: number;
  fallbackIncrease?: number;
}

/**
 * サポーター数表示コンポーネント
 *
 * チームみらいのサポーター数とその増加数を表示します。
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
    <div className="mb-6">
      <div
        className="p-4 text-center rounded"
        style={{ backgroundColor: "#F9F9F9" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <p className="text-sm font-bold text-black">
            チームみらい サポーター数
          </p>
        </div>
        {/* 総サポーター数（大きく表示） */}
        <p className="text-3xl font-bold text-teal-700 mb-1">
          {formatNumber(supporterCount)}
          <span className="text-xl">人</span>
        </p>
        {/* 24時間の増加数 */}
        <p className="text-sm text-black">
          1日で{" "}
          <span className="font-bold text-teal-700">
            +{formatNumber(supporterIncrease)}
            <span className="text-xs">人！</span>
          </span>
        </p>
      </div>
    </div>
  );
}
