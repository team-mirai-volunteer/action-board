import { calculateAge } from "@/lib/utils/utils";

/**
 * 年/月/日の数値から "YYYY-MM-DD" 形式の文字列を生成する
 * いずれかがnullの場合は空文字列を返す
 */
export function formatDateComponents(
  year: number | null,
  month: number | null,
  day: number | null,
): string {
  if (!year || !month || !day) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * 指定された年月の日数を配列として返す
 * 例: getDaysInMonth(2024, 2) => [1, 2, ..., 29] (うるう年)
 */
export function getDaysInMonth(year: number, month: number): number[] {
  const daysCount = new Date(year, month, 0).getDate();
  return Array.from({ length: daysCount }, (_, i) => i + 1);
}

/**
 * 生年月日が指定された最低年齢以上かを判定する
 * @returns isValid: 年齢条件を満たすか, message: エラーメッセージ（条件を満たす場合はnull）
 */
export function verifyMinimumAge(
  birthdate: string,
  minimumAge: number,
): { isValid: boolean; message: string | null } {
  if (!birthdate) {
    return { isValid: false, message: null };
  }

  const age = calculateAge(birthdate);
  if (age < minimumAge) {
    const yearsToWait = minimumAge - age;
    const waitText = yearsToWait > 1 ? `あと${yearsToWait}年で` : "もうすぐ";
    return {
      isValid: false,
      message: `${minimumAge}歳以上の方のみご登録いただけます。${waitText}登録できますので、その日を楽しみにお待ちください！`,
    };
  }

  return { isValid: true, message: null };
}
