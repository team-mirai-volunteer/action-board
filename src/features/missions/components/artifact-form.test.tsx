import { render, screen } from "@testing-library/react";
import type { Tables } from "@/lib/types/supabase";
import { ArtifactForm } from "./artifact-form";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
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
  required_artifact_type: "LINK",
};

describe("ArtifactForm", () => {
  it("ARTIFACT_TYPE.NONEの場合は何も表示されない", () => {
    const mission = { ...baseMission, required_artifact_type: "NONE" as const };

    const { container } = render(
      <ArtifactForm mission={mission} disabled={false} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("LINKタイプの場合はURL入力フォームが表示される", () => {
    const mission = { ...baseMission, required_artifact_type: "LINK" as const };

    render(<ArtifactForm mission={mission} disabled={false} />);

    expect(screen.getByText("ミッション完了を記録しよう")).toBeInTheDocument();
    expect(screen.getByLabelText(/テストラベル/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("テストラベルを入力してください"),
    ).toBeInTheDocument();
  });

  it("TEXTタイプの場合はテキスト入力フォームが表示される", () => {
    const mission = { ...baseMission, required_artifact_type: "TEXT" as const };

    render(<ArtifactForm mission={mission} disabled={false} />);

    expect(screen.getByLabelText(/テストラベル/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("テストラベルを入力してください"),
    ).toBeInTheDocument();
  });

  it("EMAILタイプの場合はメール入力フォームが表示される", () => {
    const mission = {
      ...baseMission,
      required_artifact_type: "EMAIL" as const,
    };

    render(<ArtifactForm mission={mission} disabled={false} />);

    const emailInput = screen.getByPlaceholderText(
      "テストラベルを入力してください",
    );
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("POSTINGタイプの場合はポスティング入力フォームが表示される", () => {
    const mission = {
      ...baseMission,
      required_artifact_type: "POSTING" as const,
    };

    render(<ArtifactForm mission={mission} disabled={false} />);

    expect(screen.getByText("ポスティング・配布枚数")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：50")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：1540017")).toBeInTheDocument();
  });

  it("POSTERタイプの場合はポスター入力フォームが表示される", () => {
    const mission = {
      ...baseMission,
      required_artifact_type: "POSTER" as const,
    };

    render(<ArtifactForm mission={mission} disabled={false} />);

    expect(
      screen.getByText(
        "ポスターマップ上にデータが見つからないなど、マップで報告できない場合は以下のフォームに入力してください。",
      ),
    ).toBeInTheDocument();
    // 詳細はPosterForm.test.tsxで確認
  });

  it("disabledがtrueの場合は入力フィールドが無効化される", () => {
    const mission = { ...baseMission, required_artifact_type: "LINK" as const };

    render(<ArtifactForm mission={mission} disabled={true} />);

    const input = screen.getByPlaceholderText("テストラベルを入力してください");
    expect(input).toBeDisabled();
  });

  it("補足説明テキストエリアが常に表示される", () => {
    const mission = { ...baseMission, required_artifact_type: "LINK" as const };

    render(<ArtifactForm mission={mission} disabled={false} />);

    expect(screen.getByText("補足説明 (任意)")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "達成内容に関して補足説明があれば入力してください",
      ),
    ).toBeInTheDocument();
  });
});
