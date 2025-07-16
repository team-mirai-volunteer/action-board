import type { OnboardingDialogue } from "@/lib/onboarding-texts";

/**
 * オンボーディング機能で使用する型定義
 */

// ミッションタイプ
export type MissionType = "early-vote";

// ミッション成果物タイプ
export type ArtifactType =
  | "TEXT"
  | "LINK_ACCESS"
  | "NONE"
  | "POSTER"
  | "POSTING";

// モックミッション型
export interface MockMission {
  id: string;
  title: string;
  artifact_label: string | null;
  content: string;
  icon_url: string;
  difficulty: number;
  max_achievement_count: number | null;
  event_date: string | null;
  required_artifact_type: ArtifactType;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_hidden: boolean;
  ogp_image_url: string | null;
}

// オンボーディングテキストの型
export interface OnboardingTexts {
  [key: number]: string;
}

// ミッションタイプごとのテキストマッピング
export interface MissionOnboardingTexts {
  [key: string]: OnboardingTexts;
}

// オンボーディングモーダルのProps
export interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// テキスト取得関数の引数型
export interface TextGetterDialogue {
  id: number;
  text: string;
  showScrollDown?: boolean;
  showNewButton?: boolean;
  showMissionCard?: boolean;
  showMissionDetails?: boolean;
  showPartyPeople?: boolean;
}

// フック型
export interface UseOnboardingState {
  currentDialogue: number;
  isAnimating: boolean;
  isSubmissionCompleted: boolean;
  artifactText: string;
  artifactDescription: string;
  missionType: MissionType;
}

// フック関数の戻り値型
export interface UseOnboardingActions {
  handleNext: () => void;
  handleSubmit: () => void;
  handleScrollDown: () => void;
  handleOpenChange: (open: boolean) => void;
  setArtifactText: (text: string) => void;
  setArtifactDescription: (text: string) => void;
}
