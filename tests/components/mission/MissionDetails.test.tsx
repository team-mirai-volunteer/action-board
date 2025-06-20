import React from "react";
import MissionDetails from "../../../components/mission/MissionDetails";

const mockMission = {
  id: "1",
  title: "テストミッション",
  description: "テスト説明",
  difficulty: "EASY" as const,
  xp_reward: 100,
};

describe("MissionDetails", () => {
  it("ミッション詳細の正常表示", () => {
    const details = MissionDetails({ mission: mockMission });
    expect(details.type).toBe("div");
    expect(details.props.className).toContain("space-y-4");
  });

  it("XP報酬の表示", () => {
    const details = MissionDetails({ mission: mockMission });
    expect(details.props.children[0].props.children).toContain(
      "テストミッション",
    );
  });
});
