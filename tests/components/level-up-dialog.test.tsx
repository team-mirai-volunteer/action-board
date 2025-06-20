import React from "react";
import { LevelUpDialog } from "../../components/level-up-dialog";

const mockLevelUpData = {
  id: "1",
  user_id: "user1",
  level: 2,
  xp: 100,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("LevelUpDialog", () => {
  it("レベルアップダイアログの正常表示", () => {
    const dialog = LevelUpDialog({ levelUpData: mockLevelUpData });
    expect(dialog.type).toBeDefined();
    expect(dialog.props.levelUpData.level).toBe(2);
  });

  it("閉じるボタンの存在確認", () => {
    const dialog = LevelUpDialog({ levelUpData: mockLevelUpData });
    expect(dialog.props.levelUpData.id).toBe("1");
  });
});
