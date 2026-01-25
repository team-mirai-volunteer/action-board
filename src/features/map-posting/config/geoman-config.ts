/**
 * Geoman (leaflet-geoman) の設定
 * ポスティングマップ用の描画ツール設定
 */

// Geoman日本語ツールチップ
export const geomanJaTooltips = {
  placeMarker: "クリックしてマーカーを配置",
  firstVertex: "クリックして最初の点を配置",
  continueLine: "クリックして続ける",
  finishLine: "既存のマーカーをクリックして終了",
  finishPoly: "最初のマーカーをクリックして終了",
  finishRect: "クリックして終了",
  startCircle: "クリックして円の中心を配置",
  finishCircle: "クリックして円を終了",
  placeCircleMarker: "クリックして円マーカーを配置",
  placeText: "クリックしてテキストを配置",
};

// Geoman日本語アクション
export const geomanJaActions = {
  finish: "完了",
  cancel: "キャンセル",
  removeLastVertex: "最後の点を削除",
};

// Geoman日本語ボタンタイトル
export const geomanJaButtonTitles = {
  drawMarkerButton: "マーカーを描画",
  drawPolyButton: "ポリゴンを描画",
  drawLineButton: "ラインを描画",
  drawCircleButton: "円を描画",
  drawRectButton: "四角形を描画",
  editButton: "レイヤーを編集",
  dragButton: "レイヤーを移動",
  cutButton: "レイヤーを切り取り",
  deleteButton: "レイヤーを削除",
  drawCircleMarkerButton: "円マーカーを描画",
  snappingButton: "スナップ",
  pinningButton: "ピン留め",
  rotateButton: "レイヤーを回転",
  drawTextButton: "テキストを描画",
  scaleButton: "レイヤーを拡大縮小",
  autoTracingButton: "自動トレース",
};

// Geoman日本語設定（まとめ）
export const geomanJaLang = {
  tooltips: geomanJaTooltips,
  actions: geomanJaActions,
  buttonTitles: geomanJaButtonTitles,
};

// ポスティングマップ用のGeomanコントロール設定
export const postingGeomanControls = {
  position: "topleft" as const,
  // Only enable polygon drawing
  drawMarker: false,
  drawCircleMarker: false,
  drawPolyline: false,
  drawRectangle: false,
  drawPolygon: true,
  drawCircle: false,
  drawText: false,
  // modes
  editMode: false,
  dragMode: false,
  cutPolygon: false,
  removalMode: false, // 削除はモーダルから行う
  rotateMode: false,
  oneBlock: false,
  // controls
  drawControls: true,
  editControls: true,
  optionsControls: false,
  customControls: false,
};

// Geomanパスオプション
export const geomanPathOptions = {
  snappable: true,
  snapDistance: 20,
};

/**
 * ツールバーボタンにラベルを追加するユーティリティ
 */
export function addButtonLabel(selector: string, text: string): void {
  const el = document.querySelector(selector);
  if (!el) return;

  el.setAttribute("title", text);
  el.setAttribute("aria-label", text);

  // 二重追加防止
  if (el.querySelector(".pm-btn-label")) return;

  const span = document.createElement("span");
  span.className = "pm-btn-label";
  span.textContent = text;
  el.appendChild(span);
}
