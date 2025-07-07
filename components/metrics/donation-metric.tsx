import type { DonationData } from "@/lib/types/metrics";
import { formatAmount } from "@/lib/utils/metrics-formatter";
import { TooltipButton } from "../tooltip-button";

interface DonationMetricProps {
  data: DonationData | null;
  fallbackAmount?: number;
  fallbackIncrease?: number;
}

/**
 * 寄付金額表示コンポーネント
 *
 * チームみらいの寄付金額とその増加額を表示します。
 * 外部APIからのデータが取得できない場合は、環境変数のフォールバック値を使用します。
 */
export function DonationMetric({
  data,
  fallbackAmount = 0,
  fallbackIncrease = 0,
}: DonationMetricProps) {
  const donationAmount = data
    ? data.totalAmount / 10000 // 円を万円に変換
    : fallbackAmount / 10000;

  const donationIncrease = data
    ? data.last24hAmount / 10000 // 円を万円に変換
    : fallbackIncrease / 10000;

  return (
    <div className="flex-1 text-center flex flex-col justify-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <p className="text-xs font-bold text-black">現在の寄付金額</p>
        {/* 寄付金額の詳細説明ツールチップ */}
        <TooltipButton
          ariaLabel="寄付金額の詳細情報"
          tooltipId="donation-tooltip"
          tooltip={
            <>
              政治団体「チームみらい」への寄付と、
              <br />
              安野及び各公認候補予定者の政治団体への寄付の合計金額
            </>
          }
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <title>寄付金額の詳細情報</title>
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </TooltipButton>
      </div>
      {/* 総寄付金額（外部APIから取得、失敗時は環境変数フォールバック） */}
      <p className="text-2xl font-black text-black mb-1">
        {formatAmount(donationAmount)}
      </p>
      {/* 24時間の寄付金増加額 */}
      <p className="text-xs text-black">
        1日で{" "}
        <span className="font-bold text-teal-700">
          +{formatAmount(donationIncrease)}
        </span>
      </p>
    </div>
  );
}
