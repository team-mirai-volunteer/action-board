import type { User } from "@supabase/supabase-js";
import { fireEvent, render, screen } from "@testing-library/react";
import type { Tables } from "@/lib/types/supabase";
import { MissionFormWrapper } from "./mission-form-wrapper";

// Mock lucide-react icons used by this component (AlertCircle only)
jest.mock("lucide-react", () => ({
  AlertCircle: () => <div data-testid="alert-icon" />,
}));

// Mock hooks
jest.mock("@/features/missions/hooks/use-mission-submission", () => ({
  useMissionSubmission: jest.fn(() => ({
    buttonLabel: "達成を記録する",
    isButtonDisabled: false,
    hasReachedUserMaxAchievements: false,
  })),
}));

jest.mock("@/features/missions/hooks/use-quiz-mission", () => ({
  useQuizMission: jest.fn(() => ({
    quizCategory: null,
    quizKey: 0,
    isSubmitting: false,
    handleQuizComplete: jest.fn(),
    handleQuizSubmit: jest.fn(),
  })),
}));

// Mock server action
jest.mock("@/features/mission-detail/actions/actions", () => ({
  achieveMissionAction: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock child components
jest.mock(
  "@/features/mission-detail/components/mission-complete-dialog",
  () => ({
    MissionCompleteDialog: () => <div data-testid="mission-complete-dialog" />,
  }),
);

jest.mock("@/features/mission-detail/components/main-link-button", () => ({
  MainLinkButton: () => <div data-testid="main-link-button" />,
}));

jest.mock("@/features/missions/components/quiz-component", () => ({
  __esModule: true,
  default: () => <div data-testid="quiz-component" />,
}));

jest.mock("@/features/user-level/components/xp-progress-toast-content", () => ({
  XpProgressToastContent: () => <div data-testid="xp-progress-toast-content" />,
}));

jest.mock("sonner", () => ({
  toast: { custom: jest.fn(), dismiss: jest.fn() },
}));

// Mock ArtifactForm - capture onValidityChange so tests can trigger it
let capturedOnValidityChange: ((isValid: boolean) => void) | undefined;
jest.mock("@/features/missions/components/artifact-form", () => ({
  ArtifactForm: ({
    onValidityChange,
    disabled,
  }: {
    onValidityChange?: (isValid: boolean) => void;
    disabled: boolean;
  }) => {
    capturedOnValidityChange = onValidityChange;
    return (
      <div data-testid="artifact-form" data-disabled={disabled}>
        <button
          type="button"
          onClick={() => onValidityChange?.(false)}
          data-testid="trigger-invalid"
        >
          trigger invalid
        </button>
        <button
          type="button"
          onClick={() => onValidityChange?.(true)}
          data-testid="trigger-valid"
        >
          trigger valid
        </button>
      </div>
    );
  },
}));

const baseMission: Tables<"missions"> = {
  id: "test-mission-1",
  title: "テストミッション",
  content: "テストミッションの内容",
  difficulty: 1,
  icon_url: "/test-icon.svg",
  event_date: null,
  max_achievement_count: null,
  is_featured: false,
  is_hidden: false,
  featured_importance: null,
  artifact_label: "テストラベル",
  ogp_image_url: null,
  created_at: "2025-06-22T00:00:00Z",
  updated_at: "2025-06-22T00:00:00Z",
  slug: "test-mission-1",
  required_artifact_type: "RESIDENTIAL_POSTER",
};

const baseAuthUser = { id: "test-user-id" } as User;

describe("MissionFormWrapper", () => {
  beforeEach(() => {
    capturedOnValidityChange = undefined;
  });

  it("RESIDENTIAL_POSTERミッションでArtifactFormとSubmitButtonが描画される", () => {
    render(
      <MissionFormWrapper
        mission={baseMission}
        authUser={baseAuthUser}
        userAchievementCount={0}
      />,
    );

    expect(screen.getByTestId("artifact-form")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "達成を記録する" }),
    ).toBeInTheDocument();
  });

  it("ArtifactFormにonValidityChangeが渡される", () => {
    render(
      <MissionFormWrapper
        mission={baseMission}
        authUser={baseAuthUser}
        userAchievementCount={0}
      />,
    );

    expect(capturedOnValidityChange).toBeDefined();
    expect(typeof capturedOnValidityChange).toBe("function");
  });

  it("onValidityChange(false)が呼ばれるとSubmitButtonがdisabledになる", () => {
    render(
      <MissionFormWrapper
        mission={baseMission}
        authUser={baseAuthUser}
        userAchievementCount={0}
      />,
    );

    // 初期状態: SubmitButtonは有効
    const submitButton = screen.getByRole("button", {
      name: "達成を記録する",
    });
    expect(submitButton).not.toBeDisabled();

    // ArtifactFormがinvalidを通知
    fireEvent.click(screen.getByTestId("trigger-invalid"));

    // SubmitButtonがdisabledになる
    expect(submitButton).toBeDisabled();
  });

  it("onValidityChange(true)で再度有効化される", () => {
    render(
      <MissionFormWrapper
        mission={baseMission}
        authUser={baseAuthUser}
        userAchievementCount={0}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: "達成を記録する",
    });

    // invalid → disabled
    fireEvent.click(screen.getByTestId("trigger-invalid"));
    expect(submitButton).toBeDisabled();

    // valid → not disabled
    fireEvent.click(screen.getByTestId("trigger-valid"));
    expect(submitButton).not.toBeDisabled();
  });

  it("max達成数に達した場合フォームは描画されない", () => {
    const {
      useMissionSubmission,
    } = require("@/features/missions/hooks/use-mission-submission");
    (useMissionSubmission as jest.Mock).mockReturnValueOnce({
      buttonLabel: "達成を記録する",
      isButtonDisabled: false,
      hasReachedUserMaxAchievements: true,
    });

    render(
      <MissionFormWrapper
        mission={{ ...baseMission, max_achievement_count: 1 }}
        authUser={baseAuthUser}
        userAchievementCount={1}
      />,
    );

    expect(screen.queryByTestId("artifact-form")).not.toBeInTheDocument();
  });
});
