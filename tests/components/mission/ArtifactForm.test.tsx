import React from "react";
import ArtifactForm from "../../../components/mission/ArtifactForm";

const mockMission = {
  id: "1",
  title: "テストミッション",
  artifact_type: "LINK" as const,
};

describe("ArtifactForm", () => {
  it("アーティファクトフォームの正常レンダリング", () => {
    const form = ArtifactForm({ mission: mockMission });
    expect(form.type).toBe("div");
    expect(form.props.className).toContain("space-y-4");
  });

  it("リンクタイプのフォーム表示", () => {
    const form = ArtifactForm({ mission: mockMission });
    expect(form.props.children[0].props.children).toContain("テストミッション");
  });
});
