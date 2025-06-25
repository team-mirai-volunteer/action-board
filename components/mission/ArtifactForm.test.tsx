import { ArtifactForm } from "@/components/mission/ArtifactForm";
import type { Tables } from "@/lib/types/supabase";
import type { User } from "@supabase/supabase-js";
import { render, screen } from "@testing-library/react";
import React from "react";

const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  created_at: "2025-06-22T00:00:00Z",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  role: "authenticated",
};

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
  artifact_label: "テストラベル",
  ogp_image_url: null,
  created_at: "2025-06-22T00:00:00Z",
  updated_at: "2025-06-22T00:00:00Z",
  required_artifact_type: "LINK",
};

describe("ArtifactForm", () => {
  it("ARTIFACT_TYPE.NONEの場合は何も表示されない", () => {
    const mission = { ...baseMission, required_artifact_type: "NONE" as const };

    const { container } = render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("LINKタイプの場合はURL入力フォームが表示される", () => {
    const mission = { ...baseMission, required_artifact_type: "LINK" as const };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

    expect(screen.getByText("ミッション完了を記録しよう")).toBeInTheDocument();
    expect(screen.getByLabelText(/テストラベル/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("テストラベルを入力してください"),
    ).toBeInTheDocument();
  });

  it("TEXTタイプの場合はテキスト入力フォームが表示される", () => {
    const mission = { ...baseMission, required_artifact_type: "TEXT" as const };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

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

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

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

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

    expect(screen.getByText("ポスティング枚数")).toBeInTheDocument();
    expect(
      screen.getByText("ポスティング場所の郵便番号（ハイフンなし）"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：50")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：1540017")).toBeInTheDocument();
  });

  it("IMAGEタイプの場合は画像アップロードフォームが表示される", () => {
    const mission = {
      ...baseMission,
      required_artifact_type: "IMAGE" as const,
    };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

    expect(screen.getByText("画像ファイル")).toBeInTheDocument();
  });

  it("IMAGE_WITH_GEOLOCATIONタイプの場合は画像と位置情報フォームが表示される", () => {
    const mission = {
      ...baseMission,
      required_artifact_type: "IMAGE_WITH_GEOLOCATION" as const,
    };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

    expect(screen.getByText("画像ファイル")).toBeInTheDocument();
    expect(screen.getByText("位置情報を取得する")).toBeInTheDocument();
  });

  it("提出済み画像がある場合はプレビューが表示される", () => {
    const mission = {
      ...baseMission,
      required_artifact_type: "IMAGE" as const,
    };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath="/path/to/submitted/image.jpg"
      />,
    );

    expect(screen.getByText("提出済み画像:")).toBeInTheDocument();
    expect(screen.getByAltText("提出済み画像")).toBeInTheDocument();
  });

  it("disabledがtrueの場合は入力フィールドが無効化される", () => {
    const mission = { ...baseMission, required_artifact_type: "LINK" as const };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={true}
        submittedArtifactImagePath={null}
      />,
    );

    const input = screen.getByPlaceholderText("テストラベルを入力してください");
    expect(input).toBeDisabled();
  });

  it("補足説明テキストエリアが常に表示される", () => {
    const mission = { ...baseMission, required_artifact_type: "LINK" as const };

    render(
      <ArtifactForm
        mission={mission}
        authUser={mockUser}
        disabled={false}
        submittedArtifactImagePath={null}
      />,
    );

    expect(screen.getByText("補足説明 (任意)")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "達成内容に関して補足説明があれば入力してください",
      ),
    ).toBeInTheDocument();
  });
});
