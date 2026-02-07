import { toZonedTime } from "date-fns-tz";

export function dateTimeFormatter(date: Date) {
  // ハイドレーションエラーが起きないようにタイムゾーンを指定する
  const timeZone = "Asia/Tokyo";
  const zonedDate = toZonedTime(date, timeZone);

  return zonedDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateFormatter(date: Date) {
  // ハイドレーションエラーが起きないようにタイムゾーンを指定する
  const timeZone = "Asia/Tokyo";
  const zonedDate = toZonedTime(date, timeZone);

  return zonedDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/** ローカルタイムゾーンで日付を YYYY-MM-DD 形式にフォーマット */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 日付文字列を ja-JP ロケールの短い月名形式でフォーマット (例: 2025年1月15日) */
export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** 日付を YYYY.MM.DD 形式でフォーマット */
export function formatDateLabel(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/** ISO 8601 duration (PT1H2M3S) を HH:MM:SS または MM:SS 形式にフォーマット */
export function formatIsoDuration(duration: string | null): string {
  if (!duration) return "";

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return duration;

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** 秒数を MM:SS 形式にフォーマット */
export function formatSecondsDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
