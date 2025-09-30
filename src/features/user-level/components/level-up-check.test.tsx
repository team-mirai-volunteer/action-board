import { act, render, screen, waitFor } from "@testing-library/react";
import { LevelUpCheck } from "./level-up-check";

jest.mock("@/features/user-level/components/level-up-dialog", () => ({
  LevelUpDialog: ({ isOpen, onClose, newLevel }: any) =>
    isOpen ? (
      <button type="button" data-testid="dialog" onClick={onClose}>
        Level Up to {newLevel}
      </button>
    ) : null,
}));

jest.mock("@/features/user-level/actions/level-up", () => ({
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

      await waitFor(
        () => {
          expect(screen.getByTestId("dialog")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe("ダイアログの閉じる処理", () => {
    it("ダイアログを閉じるとmarkLevelUpSeenActionが呼ばれる", async () => {
      const mockMarkLevelUpSeen =
        require("@/features/user-level/actions/level-up").markLevelUpSeenAction;
      const levelUpData = {
        previousLevel: 1,
        newLevel: 2,
        pointsToNextLevel: 500,
      };

      render(<LevelUpCheck levelUpData={levelUpData} />);

      await waitFor(
        () => {
          expect(screen.getByTestId("dialog")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      const dialog = screen.getByTestId("dialog");

      await act(async () => {
        dialog.click();
      });

      await waitFor(() => {
        expect(mockMarkLevelUpSeen).toHaveBeenCalled();
      });
    });

    it("markLevelUpSeenActionが失敗してもエラーハンドリングされる", async () => {
      const mockMarkLevelUpSeen =
        require("@/features/user-level/actions/level-up").markLevelUpSeenAction;
      mockMarkLevelUpSeen.mockResolvedValueOnce({
        success: false,
        error: "Test error",
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const levelUpData = {
        previousLevel: 1,
        newLevel: 2,
        pointsToNextLevel: 500,
      };

      render(<LevelUpCheck levelUpData={levelUpData} />);

      await waitFor(
        () => {
          expect(screen.getByTestId("dialog")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      const dialog = screen.getByTestId("dialog");

      await act(async () => {
        dialog.click();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to mark level up notification as seen:",
          "Test error",
        );
      });

      consoleSpy.mockRestore();
    });

    it("markLevelUpSeenActionで例外が発生してもエラーハンドリングされる", async () => {
      const mockMarkLevelUpSeen =
        require("@/features/user-level/actions/level-up").markLevelUpSeenAction;
      mockMarkLevelUpSeen.mockRejectedValueOnce(new Error("Network error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const levelUpData = {
        previousLevel: 1,
        newLevel: 2,
        pointsToNextLevel: 500,
      };

      render(<LevelUpCheck levelUpData={levelUpData} />);

      await waitFor(
        () => {
          expect(screen.getByTestId("dialog")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      const dialog = screen.getByTestId("dialog");

      await act(async () => {
        dialog.click();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error marking level up notification as seen:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
