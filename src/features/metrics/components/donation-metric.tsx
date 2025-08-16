"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EXTERNAL_LINKS } from "@/lib/links";
import { formatAmount } from "@/lib/utils/metrics-formatter";
import { useEffect, useState } from "react";
import type { DonationData } from "../types";

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
  const [isMobile, setIsMobile] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    };
    setIsMobile(checkIsMobile());
  }, []);

  const YEN_TO_MAN_DIVISOR = 10000;

  const safeDivision = (value: unknown): number => {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      return 0;
    }
    return value / YEN_TO_MAN_DIVISOR;
  };

  const donationAmount = data
    ? safeDivision(data.totalAmount)
    : safeDivision(fallbackAmount);

  const donationIncrease = data
    ? safeDivision(data.last24hAmount)
    : safeDivision(fallbackIncrease);

  const handlePopoverClick = () => {
    if (isMobile) {
      setIsTooltipOpen(!isTooltipOpen);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-6 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-base text-black whitespace-nowrap">寄付金額</p>
          {/* 寄付金額の詳細説明ツールチップ */}
          <Popover open={isMobile ? isTooltipOpen : undefined}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                aria-label="寄付金額の詳細情報"
                onClick={handlePopoverClick}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>寄付金額の詳細情報</title>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent>
              政治団体「チームみらい」への寄付と、
              <br />
              安野及び各公認候補予定者の政治団体への寄付の合計金額
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-right">
          {/* 総寄付金額（外部APIから取得、失敗時は環境変数フォールバック） */}
          <p className="text-2xl font-black text-gray-800 whitespace-nowrap">
            {(() => {
              const formatted = formatAmount(donationAmount);
              if (formatted.includes("億") && formatted.includes("万")) {
                // 例: "1億456.9万円" -> "1億456.9" + "万円"
                const withoutManYen = formatted.replace(/万円$/, "");
                return (
                  <>
                    {withoutManYen}
                    <span className="text-lg">万円</span>
                  </>
                );
              }
              if (formatted.includes("億")) {
                // 例: "1億円" -> "1" + "億円"
                const number = formatted.replace(/億円$/, "");
                return (
                  <>
                    {number}
                    <span className="text-lg">億円</span>
                  </>
                );
              }
              // 例: "456.9万円" -> "456.9" + "万円"
              const number = formatted.replace(/万円$/, "");
              return (
                <>
                  {number}
                  <span className="text-lg">万円</span>
                </>
              );
            })()}
          </p>
          {/* 24時間の寄付金増加額 */}
          <p className="text-xs text-gray-600">
            1日で{" "}
            <span className="font-bold text-teal-700">
              +{formatAmount(donationIncrease)}
            </span>
          </p>
        </div>
      </div>
      {/* 寄付リンク */}
      <div className="mt-4 text-center">
        <a
          href={EXTERNAL_LINKS.team_mirai_donation}
          className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>チームみらいを寄付で応援する</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>外部リンク</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </>
  );
}
