/**
 * 配布枚数ラベル生成ユーティリティ
 * DRY: addPostingCountLabelとhandleStatusUpdatedで重複していたロジックを統合
 */

// Create posting count label icon
export function createPostingLabelIcon(
  L: typeof import("leaflet"),
  postingCount: number,
) {
  return L.divIcon({
    html: `<div class="posting-count-label">${postingCount}枚</div>`,
    className: "posting-count-marker",
    iconSize: [50, 20],
    iconAnchor: [25, 10],
  });
}
