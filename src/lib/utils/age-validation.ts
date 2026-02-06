import { calculateAge } from "@/lib/utils/utils";

/**
 * 18歳未満の場合にエラーメッセージを返す。18歳以上ならnullを返す。
 */
export function validateAge(dateOfBirth: string): string | null {
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    const yearsToWait = 18 - age;
    const waitText = yearsToWait > 1 ? `あと${yearsToWait}年で` : "もうすぐ";
    return `18歳以上の方のみご登録いただけます。${waitText}登録できますので、その日を楽しみにお待ちください！`;
  }
  return null;
}
