/**
 * 配布枚数ラベル生成ユーティリティ
 * DRY: addPostingCountLabelとhandleStatusUpdatedで重複していたロジックを統合
 */

// Calculate dynamic icon width based on digit count
function getLabelIconWidth(postingCount: number): number {
  const digits = postingCount.toString().length;
  // Base width + extra per digit + padding for "枚"
  return Math.max(50, 30 + digits * 10);
}

// Create posting count label icon
export function createPostingLabelIcon(
  L: typeof import("leaflet"),
  postingCount: number,
) {
  const iconWidth = getLabelIconWidth(postingCount);
  return L.divIcon({
    html: `<div class="posting-count-label">${postingCount}枚</div>`,
    className: "posting-count-marker",
    iconSize: [iconWidth, 20],
    iconAnchor: [iconWidth / 2, 10],
  });
}
