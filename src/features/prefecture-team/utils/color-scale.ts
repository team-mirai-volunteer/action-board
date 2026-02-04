/**
 * 都道府県対抗ランキングの地図表示用色分けユーティリティ
 * 順位に応じて青系のグラデーションで色分けする
 */

// 青系グラデーション（1位=濃い青、47位=薄い青）
const COLOR_PALETTE = [
  "#08306b", // 1位〜5位: 最も濃い青
  "#08519c", // 6位〜10位
  "#2171b5", // 11位〜15位
  "#4292c6", // 16位〜20位
  "#6baed6", // 21位〜25位
  "#9ecae1", // 26位〜30位
  "#c6dbef", // 31位〜35位
  "#deebf7", // 36位〜40位
  "#f7fbff", // 41位〜47位: 最も薄い青
];

const TOTAL_PREFECTURES = 47;
const COLORS_COUNT = COLOR_PALETTE.length;

/**
 * 順位に応じた色を返す
 * @param rank 順位（1〜47）
 * @returns 色コード（例: "#08306b"）
 */
export function getColorForRank(rank: number): string {
  if (rank < 1 || rank > TOTAL_PREFECTURES) {
    return "#e5e7eb"; // グレー（無効な順位）
  }

  // 順位を色パレットのインデックスに変換
  const index = Math.floor(((rank - 1) / TOTAL_PREFECTURES) * COLORS_COUNT);

  return COLOR_PALETTE[Math.min(index, COLORS_COUNT - 1)];
}

/**
 * データがない都道府県用のグレー色
 */
export const NO_DATA_COLOR = "#e5e7eb";

/**
 * 凡例用の色パレット情報
 */
export const LEGEND_COLORS = COLOR_PALETTE.map((color, index) => ({
  color,
  label:
    index === 0
      ? "1位〜"
      : index === COLORS_COUNT - 1
        ? `${Math.floor((TOTAL_PREFECTURES / COLORS_COUNT) * index) + 1}位〜`
        : "",
}));
