/**
 * レイアウト関連の定数
 */

/** ヘッダーの高さ（px） - Tailwind の h-16 に対応 */
export const HEADER_HEIGHT = 64;

/** ヘッダーの高さ（CSS用文字列） */
export const HEADER_HEIGHT_PX = `${HEADER_HEIGHT}px`;

/** ヘッダーを除いた画面の高さ（CSS用文字列） */
export const CONTENT_HEIGHT = `calc(100vh - ${HEADER_HEIGHT}px)`;
