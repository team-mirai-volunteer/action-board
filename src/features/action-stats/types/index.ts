import type { Tables } from "@/lib/types/supabase";

export type Achievement = Tables<"achievements">;
export type Mission = Tables<"missions">;
export type DailyActionSummary = Tables<"daily_action_summary">;

/**
 * アクション統計のサマリー
 */
export interface ActionStatsSummary {
  totalActions: number;
  activeUsers: number;
  dailyActionsIncrease: number;
  dailyActiveUsersIncrease: number;
}

/**
 * 日別アクション数
 */
export interface DailyActionItem {
  date: string;
  count: number;
}

/**
 * ミッション別アクションランキング
 */
export interface MissionActionRanking {
  missionId: string;
  title: string;
  slug: string;
  iconUrl: string | null;
  achievementCount: number;
}

/**
 * 期間タイプ
 */
export type PeriodType =
  | "30"
  | "90"
  | "180"
  | "365"
  | "this_year"
  | "all_time"
  | "custom";

/**
 * 期間オプション
 */
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
 * YYYY-MM-DD形式の日付文字列をローカルタイムゾーンのDateオブジェクトに変換
 * new Date('YYYY-MM-DD')はUTCとして解析されるため、タイムゾーンずれを防ぐ
 * @param dateStr - YYYY-MM-DD形式の日付文字列
 * @returns Dateオブジェクト
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 期間から開始日を計算
 * @param period - 期間タイプ
 * @param customStart - カスタム開始日（YYYY-MM-DD形式）
 * @returns 開始日のDateオブジェクト、またはnull
 */
export function getPeriodStartDate(
  period: PeriodType,
  customStart?: string,
): Date | null {
  if (period === "custom") {
    return customStart ? parseLocalDate(customStart) : null;
  }
  if (period === "this_year") {
    const year = new Date().getFullYear();
    return new Date(year, 0, 1);
  }
  if (period === "all_time") {
    return null;
  }
  const days = Number.parseInt(period, 10);
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * カスタム終了日を取得
 * @param customEnd - カスタム終了日（YYYY-MM-DD形式）
 * @returns 終了日のDateオブジェクト、またはnull
 */
export function getPeriodEndDate(customEnd?: string): Date | null {
  if (customEnd) {
    return parseLocalDate(customEnd);
  }
  return null;
}
