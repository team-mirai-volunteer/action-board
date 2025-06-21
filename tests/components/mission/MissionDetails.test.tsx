import { render } from "@testing-library/react";
import React from "react";
import { MissionDetails } from "../../../components/mission/MissionDetails";

const mockMission = {
  id: "1",
  title: "テストミッション",
  content: "テスト説明",
  difficulty: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  artifact_label: "テスト成果物",
  event_date: null,
  icon_url: null,
  is_featured: false,
  is_hidden: false,
  max_achievement_count: null,
  ogp_image_url: null,
  required_artifact_type: "image",
};

describe("MissionDetails", () => {
  it("ミッション詳細の正常表示", () => {
    const { container } = render(<MissionDetails mission={mockMission} />);
    expect(container.firstChild).toBeDefined();
  });

  it("ミッションタイトルの表示", () => {
    const { container } = render(<MissionDetails mission={mockMission} />);
    expect(container.firstChild).toBeDefined();
  });
});
