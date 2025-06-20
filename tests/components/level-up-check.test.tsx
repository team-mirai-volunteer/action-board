import React from "react";
import { LevelUpCheck } from "../../components/level-up-check";

const mockLevelUpData = {
  id: "1",
  user_id: "user1",
  level: 2,
  xp: 100,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("LevelUpCheck", () => {
  it("レベルアップ通知の正常表示", () => {
    const levelUpCheck = LevelUpCheck({ levelUpData: mockLevelUpData });
    expect(levelUpCheck.type).toBeDefined();
  });

  it("レベルアップデータの処理", () => {
    const levelUpCheck = LevelUpCheck({ levelUpData: mockLevelUpData });
    expect(levelUpCheck.props.levelUpData.level).toBe(2);
  });
});
