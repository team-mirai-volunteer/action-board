import { type ClassValue, clsx } from "clsx";
import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

// 年齢計算関数：生年月日から現在の年齢を計算
export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // 誕生月がまだ来ていない、または誕生月だけど誕生日がまだの場合は年齢を1つ減らす
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// L → L+1 の差分 XP
export const xpDelta = (L: number) => {
  if (L < 1) throw new Error("Level must be at least 1");
  return 40 + 15 * (L - 1);
};

// レベル L 到達までの累計 XP
export const totalXp = (L: number) => {
  if (L < 1) throw new Error("Level must be at least 1");
  return (L - 1) * (25 + (15 / 2) * L);
};

/**
 * XPに基づくレベル計算
 * 新しい式に基づく逆算
 */
export function calculateLevel(xp: number): number {
  if (xp < 0) return 1;

  // 最大レベルを設定（計算の無限ループを防ぐため）
  const maxLevel = 1000;

  for (let level = 1; level <= maxLevel; level++) {
    const requiredXp = totalXp(level + 1);
    if (xp < requiredXp) {
      return level;
    }
  }

  return maxLevel;
}

/**
 * ミッションの難易度に基づいてXPを計算する
 */
export function calculateMissionXp(difficulty: number): number {
  switch (difficulty) {
    case 1:
      return 50; // ★1
    case 2:
      return 100; // ★2
    case 3:
      return 200; // ★3
    case 4:
      return 400; // ★4
    case 5:
      return 800; // ★5
    default:
      return 50; // デフォルト（Easy相当）
  }
}

/**
 * 次のレベルまでに必要なXP計算
 */
export function getXpToNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const nextLevelTotalXp = totalXp(currentLevel + 1);
  return Math.max(0, nextLevelTotalXp - currentXp);
}

/**
 * 現在レベルでの進捗率計算（0-1の値）
 */
export function getLevelProgress(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  const xpToNext = getXpToNextLevel(currentXp);
  const levelXpRange = xpDelta(currentLevel);
  return Math.max(0, Math.min(1, (levelXpRange - xpToNext) / levelXpRange));
}
