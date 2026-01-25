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
    <div className="py-3">
      <div className="flex items-center justify-between">
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
      <div className="mt-3 text-end">
        <a
          href="https://lookerstudio.google.com/u/0/reporting/e4efc74f-051c-4815-87f1-e4b5e93a3a8c/page/p_p5421pqhtd"
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm transition-colors"
          target="_blank"
          rel="noopener noreferrer"
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
