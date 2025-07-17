/**
 * オンボーディング機能で使用するユーティリティ関数（期日前投票専用）
 */

/**
 * HTMLコンテンツをサニタイズする関数（wbrタグのみ許可）
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/\n/g, "<br>")
    .replace(/<(?!\/?(wbr|br)(?:\s[^>]*)?\/?>)[^>]*>/g, "") // wbrとbr以外のタグを除去
    .replace(/javascript:/gi, "") // JavaScriptスキームを除去
    .replace(/on\w+\s*=/gi, ""); // イベントハンドラ属性を除去
};

/**
 * 現在のダイアログが最終画面かどうかを判定
 */
export const isFinalScreen = (
  currentDialogue: number,
  totalDialogues: number,
): boolean => {
  return currentDialogue === totalDialogues - 1;
};

import { BUTTON_TEXT } from "./constants";

/**
 * ボタンテキストを取得
 */
export const getButtonText = (
  currentDialogue: number,
  isWelcome: boolean,
  isFinal: boolean,
): string => {
  if (currentDialogue === 0 && isWelcome) {
    return BUTTON_TEXT.START;
  }
  if (isFinal) {
    return BUTTON_TEXT.FINISH;
  }
  return BUTTON_TEXT.NEXT;
};

/**
 * スクロール位置を計算
 */
export const calculateScrollPosition = (
  container: HTMLElement,
  targetElement: HTMLElement | null,
  offset = 20,
): number => {
  if (!targetElement) return 0;

  const cardBottom = targetElement.getBoundingClientRect().bottom;
  const containerTop = container.getBoundingClientRect().top;
  const scrollAmount =
    cardBottom - containerTop - container.clientHeight + offset;

  return Math.max(0, scrollAmount);
};

/**
 * デフォルトスクロール位置を計算
 */
export const calculateDefaultScrollPosition = (
  container: HTMLElement,
  maxScroll = 300,
): number => {
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  return Math.min(scrollHeight - clientHeight, maxScroll);
};
