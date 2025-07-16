import { ONBOARDING_TEXTS } from "./constants";
import type {
  MissionOnboardingTexts,
  MissionType,
  TextGetterDialogue,
} from "./types";

/**
 * オンボーディング機能で使用するユーティリティ関数
 */

/**
 * HTMLコンテンツをサニタイズする関数（wbrタグのみ許可）
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/\n/g, "<br>")
    .replace(/<(?!\/?(wbr|br)(?:\s[^>]*)?\/?>)[^>]*>/g, ""); // wbrとbr以外のタグを除去
};

/**
 * ミッションタイプに応じたオンボーディングテキストを取得
 */
export const getDynamicOnboardingText = (
  dialogue: TextGetterDialogue,
  missionType: MissionType,
): string => {
  const customTexts = ONBOARDING_TEXTS[missionType];

  if (customTexts && dialogue.id in customTexts) {
    return customTexts[dialogue.id as keyof typeof customTexts];
  }

  // デフォルトテキストは使用しない
  return "";
};

/**
 * 現在のダイアログがウェルカム画面かどうかを判定
 */
export const isWelcomeScreen = (dialogue: TextGetterDialogue): boolean => {
  return dialogue.id === 1;
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

/**
 * ボタンテキストを取得
 */
export const getButtonText = (
  currentDialogue: number,
  isWelcome: boolean,
  isFinal: boolean,
): string => {
  if (currentDialogue === 0 && isWelcome) {
    return "はじめる";
  }
  if (isFinal) {
    return "始める";
  }
  return "次へ";
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
