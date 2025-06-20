import React from "react";
import { LevelUpCheck } from "../../components/level-up-check";

jest.mock("../../components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog" }, children),
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog-content" }, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "dialog-header" }, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", { "data-testid": "dialog-title" }, children),
}));

const mockLevelUpData = {
  previousLevel: 1,
  newLevel: 2,
  pointsToNextLevel: 100,
};

describe("LevelUpCheck", () => {
  it("レベルアップ通知の正常表示", () => {
    const levelUpCheck = LevelUpCheck({ levelUpData: mockLevelUpData });
    expect(levelUpCheck).toBeDefined();
  });

  it("レベルアップデータの処理", () => {
    const levelUpCheck = LevelUpCheck({ levelUpData: mockLevelUpData });
    expect(levelUpCheck).toBeDefined();
  });
});
