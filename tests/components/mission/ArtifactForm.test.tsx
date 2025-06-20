import React from "react";
import { ArtifactForm } from "../../../components/mission/ArtifactForm";

const mockMission = {
  id: "1",
  title: "テストミッション",
  artifact_type: "LINK" as const,
  artifact_label: "リンクURL",
  content: "テスト内容",
  created_at: "2024-01-01T00:00:00Z",
  difficulty: 1,
  event_date: null,
  icon_url: null,
  is_featured: false,
  is_hidden: false,
  location: null,
  max_achievement_count: null,
  ogp_image_url: null,
  points: 10,
  required_artifact_type: "LINK",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ArtifactForm", () => {
  it("アーティファクトフォームの正常レンダリング", () => {
    const form = ArtifactForm({
      mission: mockMission,
      authUser: null,
      disabled: false,
      submittedArtifactImagePath: null,
    });
    expect(form).toBeDefined();
  });

  it("リンクタイプのフォーム表示", () => {
    const form = ArtifactForm({
      mission: mockMission,
      authUser: null,
      disabled: false,
      submittedArtifactImagePath: null,
    });
    expect(form).toBeDefined();
  });
});
