/**
 * 市区町村集計マーカーのサイズを合計枚数に応じて決定する
 * 枚数が多いほど大きなマーカーで視覚的に区別する
 */
function getMarkerSize(totalCount: number): number {
  if (totalCount < 5) return 36;
  if (totalCount < 20) return 44;
  if (totalCount < 100) return 52;
  return 60;
}

/**
 * 市区町村集計マーカーの背景色を合計枚数に応じて決定する
 * 枚数が多いほど暖色に変化
 */
function getMarkerColor(totalCount: number): string {
  if (totalCount < 5) return "#60A5FA"; // blue-400（少）
  if (totalCount < 20) return "#34D399"; // emerald-400（中）
  if (totalCount < 100) return "#FBBF24"; // amber-400（多）
  return "#F87171"; // red-400（非常に多）
}

/**
 * 市区町村集計マーカーの Leaflet divIcon を作成する
 *
 * @param L - Leaflet ライブラリ（dynamic import で取得したもの）
 * @param totalCount - 合計掲示枚数
 * @param _cityName - 市区町村名（現在未使用だが将来のツールチップ等に備えて受け取る）
 * @returns Leaflet DivIcon インスタンス
 */
// biome-ignore lint/suspicious/noExplicitAny: Leaflet type from dynamic import
export function createCityStatsMarkerIcon(
  L: any,
  totalCount: number,
  _cityName: string,
) {
  const size = getMarkerSize(totalCount);
  const color = getMarkerColor(totalCount);
  const fontSize =
    size <= 36 ? "11px" : size <= 44 ? "12px" : size <= 52 ? "13px" : "14px";

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${fontSize};
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      ">${totalCount}</div>
    `,
    className: "city-stats-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
