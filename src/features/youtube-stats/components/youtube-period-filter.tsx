"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { PERIOD_OPTIONS, type PeriodType } from "../types";
import { DatePicker } from "./date-picker";

/** ローカルタイムゾーンで日付を YYYY-MM-DD 形式にフォーマット */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface YouTubePeriodFilterProps {
  defaultPeriod?: PeriodType;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function YouTubePeriodFilter({
  defaultPeriod = "all",
  defaultStartDate,
  defaultEndDate,
}: YouTubePeriodFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPeriod =
    (searchParams.get("period") as PeriodType) || defaultPeriod;
  const currentStartDate =
    searchParams.get("startDate") || defaultStartDate || "";
  const currentEndDate = searchParams.get("endDate") || defaultEndDate || "";

  const startDateObj = useMemo(
    () => (currentStartDate ? new Date(currentStartDate) : undefined),
    [currentStartDate],
  );
  const endDateObj = useMemo(
    () => (currentEndDate ? new Date(currentEndDate) : undefined),
    [currentEndDate],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // ページをリセット
      params.delete("page");
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  const handlePeriodChange = useCallback(
    (period: PeriodType) => {
      if (period === "custom") {
        // カスタムの場合、デフォルトで過去30日を設定
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        updateParams({
          period,
          startDate: formatLocalDate(start),
          endDate: formatLocalDate(end),
        });
      } else {
        updateParams({
          period,
          startDate: null,
          endDate: null,
        });
      }
    },
    [updateParams],
  );

  const handleStartDateChange = useCallback(
    (date: Date | undefined) => {
      updateParams({
        startDate: date ? formatLocalDate(date) : null,
      });
    },
    [updateParams],
  );

  const handleEndDateChange = useCallback(
    (date: Date | undefined) => {
      updateParams({
        endDate: date ? formatLocalDate(date) : null,
      });
    },
    [updateParams],
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">期間:</span>
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[130px] h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {currentPeriod === "custom" && (
        <>
          <DatePicker
            date={startDateObj}
            onSelect={handleStartDateChange}
            placeholder="開始日"
          />
          <span className="text-sm text-gray-600">〜</span>
          <DatePicker
            date={endDateObj}
            onSelect={handleEndDateChange}
            placeholder="終了日"
          />
        </>
      )}
    </div>
  );
}
