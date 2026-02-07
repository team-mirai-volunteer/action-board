/**
 * 数値を日本語形式でフォーマットする
 * - 1万未満: カンマ区切り (例: 9,999)
 * - 1万以上1億未満: 万単位 (例: 1.5万, 100万)
 * - 1億以上: 億単位 (例: 1.2億)
 */
export function formatNumberJa(num: number | null): string {
  if (num === null) return "-";

  const absNum = Math.abs(num);

  // 1億以上
  if (absNum >= 100_000_000) {
    const value = num / 100_000_000;
    return value % 1 === 0 ? `${value}億` : `${value.toFixed(1)}億`;
  }

  // 1万以上
  if (absNum >= 10_000) {
    const value = num / 10_000;
    return value % 1 === 0 ? `${value}万` : `${value.toFixed(1)}万`;
  }

  // 1万未満
  return num.toLocaleString();
}

/**
 * グラフ軸用の短縮フォーマット
 * - 1万未満: そのまま
 * - 1万以上: 万単位（小数なし）
 * - 1億以上: 億単位
 */
export function formatNumberJaShort(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 100_000_000) {
    return `${Math.round(num / 100_000_000)}億`;
  }

  if (absNum >= 10_000) {
    return `${Math.round(num / 10_000)}万`;
  }

  return num.toLocaleString();
}

/** 数値をカンマ区切りでフォーマットする (toLocaleString ラッパー) */
export function formatNumberLocale(num: number): string {
  return num.toLocaleString();
}
