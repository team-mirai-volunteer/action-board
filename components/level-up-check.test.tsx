import { render, screen } from "@testing-library/react";
import React from "react";
import { LevelUpCheck } from "./level-up-check";

jest.mock("@/components/level-up-dialog", () => ({
  LevelUpDialog: ({ isOpen, onClose, newLevel }: any) =>
    isOpen ? <div data-testid="dialog">Level Up to {newLevel}</div> : null,
}));

jest.mock("@/app/actions/level-up", () => ({
  markLevelUpSeenAction: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("LevelUpCheck", () => {
  describe("基本的な表示", () => {
    it("レベルアップデータがない場合はnullを返す", () => {
      render(<LevelUpCheck />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("レベルアップデータがある場合はダイアログが表示される", async () => {
      const levelUpData = {
        previousLevel: 1,
        newLevel: 2,
        pointsToNextLevel: 500,
      };

      render(<LevelUpCheck levelUpData={levelUpData} />);

      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
    });
  });
});
