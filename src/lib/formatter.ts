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
