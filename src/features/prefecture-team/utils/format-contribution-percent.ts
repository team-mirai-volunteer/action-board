/**
 * 貢献度のパーセンテージを適切な小数点桁数でフォーマットする
 * - 0.1以上: 小数点第1位
 * - 0.01以上: 小数点第2位
 * - 0.001以上: 小数点第3位
 * - 0.001未満: 有効数字が出るまで桁数を増やす（最大6桁）
 */
export function formatContributionPercent(percent: number): string {
  if (percent === 0) return "0";
  if (percent >= 0.1) return percent.toFixed(1);
  if (percent >= 0.01) return percent.toFixed(2);
  if (percent >= 0.001) return percent.toFixed(3);
  if (percent >= 0.0001) return percent.toFixed(4);
  if (percent >= 0.00001) return percent.toFixed(5);
  if (percent >= 0.000001) return percent.toFixed(6);
  return "< 0.000001";
}
