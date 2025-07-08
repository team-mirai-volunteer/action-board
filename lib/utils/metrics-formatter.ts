/**
 * メトリクス表示用のフォーマット関数群
 */

/**
 * 更新日時を日本語形式でフォーマット
 * @param timestamp - ISO形式の日時文字列
 * @returns 日本語ロケールでフォーマットされた日時文字列（例: "2025/07/03 14:30"）
 */
export const formatUpdateTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * 金額を日本語形式でフォーマット（万円・億円単位）
 *
 * 例：
 * - 1234万円 → "1234万円"
 * - 12345万円 → "1億2345万円"
 * - 10000万円 → "1億円"
 * - 1234.5万円 → "1234.5万円"
 * - 1234.0万円 → "1234万円"（小数点以下0は省略）
 *
 * @param amount - 万円単位の金額
 * @returns フォーマットされた金額文字列
 */
export const formatAmount = (amount: number): string => {
  const oku = Math.floor(amount / 10000); // 億の部分
  const man = amount % 10000; // 万の部分

  if (oku === 0) {
    const formatted = man.toFixed(1);
    const display = formatted.endsWith(".0")
      ? formatted.slice(0, -2) // 小数点以下0は省略
      : formatted;
    return `${display}万円`;
  }

  if (man === 0) {
    return `${oku}億円`;
  }

  const manFormatted = man.toFixed(1);
  const manDisplay = manFormatted.endsWith(".0")
    ? manFormatted.slice(0, -2) // 小数点以下0は省略
    : manFormatted;
  return `${oku}億${manDisplay}万円`;
};

/**
 * 数値を日本語ロケールでフォーマット（カンマ区切り）
 * @param value - フォーマット対象の数値
 * @returns カンマ区切りでフォーマットされた文字列
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};
