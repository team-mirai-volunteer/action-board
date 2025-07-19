/**
 * オンボーディング機能で使用する型定義（期日前投票専用）
 */

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
  required_artifact_type: "NONE";
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_hidden: boolean;
  ogp_image_url: string | null;
}

// オンボーディングモーダルのProps
export interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// フック型
export interface UseOnboardingState {
  currentDialogue: number;
  isAnimating: boolean;
  isSubmissionCompleted: boolean;
}

// フック関数の戻り値型
export interface UseOnboardingActions {
  handleNext: () => void;
  handleSubmit: () => void;
  handleScrollDown: () => void;
  handleOpenChange: (open: boolean) => void;
}
