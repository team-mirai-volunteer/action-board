/**
 * オンボーディング機能で使用する定数
 */

// アニメーション関連の定数
export const ANIMATION_DURATION = {
  PAGE_TRANSITION: 150,
  SUBMISSION_COMPLETE: 300,
  SCROLL_ANIMATION: 1500,
} as const;

// スクロール関連の定数
export const SCROLL_OFFSET = {
  DEFAULT: 300,
  CARD_MARGIN: 20,
} as const;

// モックミッション（期日前投票専用）
export const MOCK_MISSION = {
  id: "3",
  title: "期日前投票をしよう！",
  artifact_label: null,
  content:
    "<p>予定が合わない方も安心！</p><p>みんなで投票率アップを目指そう！</p>",
  icon_url:
    "/img/mission-icons/actionboard_icon_work_20250713_ol_early-vote.svg",
  difficulty: 5,
  max_achievement_count: 1,
  event_date: null,
  required_artifact_type: "NONE",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_featured: false,
  is_hidden: false,
  ogp_image_url: null,
} as const;

// ボタンテキスト
export const BUTTON_TEXT = {
  START: "はじめる",
  NEXT: "次へ",
  BEGIN: "始める",
  CHALLENGE: "チャレンジする",
  MISSION_COMPLETE: "ミッション完了！",
  RECORD: "記録する",
  SUBMISSION_COMPLETE: "提出完了！",
} as const;

// スクロールテキスト
export const SCROLL_TEXT = "下にスクロール";

// Z-index層の定義
export const Z_INDEX = {
  ONBOARDING_MODAL: 60, // 他のモーダル(z-50)より上に表示
} as const;

// スタイルクラス名
export const STYLE_CLASSES = {
  MODAL_OVERLAY:
    "fixed inset-4 md:inset-6 lg:inset-12 z-60 duration-200 lg:max-w-4xl lg:mx-auto lg:left-0 lg:right-0",
  BACKGROUND_GRADIENT: "bg-gradient-to-b from-[#A8E6CF] to-[#7FCDCD]",
  CHARACTER_COMMENT:
    "text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-center font-medium px-4 py-2",
  BUTTON_PRIMARY:
    "bg-white text-gray-800 hover:bg-white/90 text-base py-3 rounded-full shadow-lg font-medium w-[40vw] sm:w-24 md:w-40 lg:w-44",
  BUTTON_SUBMIT:
    "w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed",
} as const;
