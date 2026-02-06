export type PeriodType =
  | "30"
  | "90"
  | "180"
  | "365"
  | "this_year"
  | "all_time"
  | "custom";

export const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "30", label: "過去30日" },
  { value: "90", label: "過去90日" },
  { value: "180", label: "過去6ヶ月" },
  { value: "365", label: "過去1年" },
  { value: "this_year", label: "今年" },
  { value: "all_time", label: "全期間" },
  { value: "custom", label: "カスタム" },
];

/**
 * 期間タイプから開始日を計算する
 */
export function getPeriodStartDate(
  period: PeriodType,
  customStart?: string,
): Date | null {
  if (period === "custom" && customStart) {
    return new Date(customStart);
  }
  if (period === "this_year") {
    const year = new Date().getFullYear();
    return new Date(`${year}-01-01`);
  }
  if (period === "all_time") {
    return null;
  }
  if (period === "custom") {
    const year = new Date().getFullYear();
    return new Date(`${year}-01-01`);
  }
  const days = Number.parseInt(period, 10);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * カスタム終了日から終了日を取得する
 */
export function getPeriodEndDate(customEnd?: string): Date | null {
  if (customEnd) {
    return new Date(customEnd);
  }
  return null;
}
