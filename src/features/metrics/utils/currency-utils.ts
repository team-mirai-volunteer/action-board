/**
 * 通貨関連のユーティリティ関数
 */

const YEN_TO_MAN_DIVISOR = 10000;

/**
 * 円の値を安全に万単位に変換する
 * null/undefined/NaN/負数は0を返す
 *
 * @param value - 円単位の金額
 * @param divisor - 除算する値（デフォルト: 10000）
 * @returns 万単位の金額
 */
export function safeYenToMan(
  value: number | null | undefined,
  divisor: number = YEN_TO_MAN_DIVISOR,
): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }
  return value / divisor;
}

/**
 * フォーマット済み金額文字列から数値部分と単位を分離する
 *
 * 例:
 * - "1億456.9万円" → { number: "1億456.9", unit: "万円" }
 * - "1億円" → { number: "1", unit: "億円" }
 * - "456.9万円" → { number: "456.9", unit: "万円" }
 *
 * @param formatted - formatAmount()でフォーマットされた金額文字列
 * @returns 数値部分と単位を含むオブジェクト
 */
export function parseCurrencyDisplay(formatted: string): {
  number: string;
  unit: string;
} {
  if (formatted.includes("億") && formatted.includes("万")) {
    const withoutManYen = formatted.replace(/万円$/, "");
    return { number: withoutManYen, unit: "万円" };
  }
  if (formatted.includes("億")) {
    const number = formatted.replace(/億円$/, "");
    return { number, unit: "億円" };
  }
  const number = formatted.replace(/万円$/, "");
  return { number, unit: "万円" };
}
