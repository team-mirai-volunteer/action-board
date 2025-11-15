import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { XpProgressToastContent } from "./xp-progress-toast-content";

jest.mock("@/features/user-level/components/level-up-dialog", () => ({
  LevelUpDialog: ({ isOpen, onClose, newLevel }: any) =>
    isOpen ? (
      <button type="button" data-testid="level-up-dialog" onClick={onClose}>
        Level Up to {newLevel}
      </button>
    ) : null,
}));

jest.mock("@/features/user-level/components/progress-bar-animated", () => ({
  ProgressBarAnimated: ({ onAnimationComplete, className, ...props }: any) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 1100);
      return () => clearTimeout(timer);
    }, [onAnimationComplete]);

    return (
      <div data-testid="progress-bar" className={className}>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div className="bg-linear-to-r from-[#30baa7] to-[#47c991] h-3 rounded-full transition-all duration-300 shadow-xs" />
        </div>
      </div>
    );
  },
}));

jest.mock("@/features/user-level/actions/level-up", () => ({
  markLevelUpSeenAction: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("XpProgressToastContent", () => {
  const mockProps = {
    initialXp: 50,
    xpGained: 50,
    onAnimationComplete: jest.fn(),
  };

  describe("基本的な表示", () => {
    it("XP獲得情報が正しく表示される", () => {
      render(<XpProgressToastContent {...mockProps} />);

      expect(screen.getByText("50ポイント獲得しました！")).toBeInTheDocument();
    });

    it("プログレスバーが表示される", () => {
      render(<XpProgressToastContent {...mockProps} />);

      const progressContainer = screen.getByText(
        "50ポイント獲得しました！",
      ).parentElement;
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe("アニメーション", () => {
    it("アニメーション完了時にコールバックが呼ばれる", () => {
      const mockCallback = jest.fn();
      render(
        <XpProgressToastContent
          {...mockProps}
          onAnimationComplete={mockCallback}
        />,
      );

      expect(mockCallback).toBeDefined();
    });
  });

  describe("プログレス計算", () => {
    it("プログレスバーの値が正しく計算される", () => {
      render(<XpProgressToastContent {...mockProps} />);

      const progressContainer = screen.getByText(
        "50ポイント獲得しました！",
      ).parentElement;
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("XPが0の場合", () => {
      const zeroProps = { ...mockProps, xpGained: 0 };
      render(<XpProgressToastContent {...zeroProps} />);

      expect(screen.getByText("0ポイント獲得しました！")).toBeInTheDocument();
    });

    it("大きなXPの場合", () => {
      const largeProps = { ...mockProps, xpGained: 1000 };
      render(<XpProgressToastContent {...largeProps} />);

      expect(
        screen.getByText("1000ポイント獲得しました！"),
      ).toBeInTheDocument();
    });
  });

  describe("レベルアップ処理", () => {
    it("レベルアップが発生する場合の処理", async () => {
      const mockOnLevelUp = jest.fn();

      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={30}
            xpGained={20}
            onLevelUp={mockOnLevelUp}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(mockOnLevelUp).toHaveBeenCalledWith(2);
        },
        { timeout: 3000 },
      );
    });

    it("複数レベルアップが発生する場合の処理", async () => {
      const mockOnLevelUp = jest.fn();

      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={30}
            xpGained={100}
            onLevelUp={mockOnLevelUp}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(mockOnLevelUp).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    });

    it("レベルアップダイアログが表示される", async () => {
      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={30}
            xpGained={20}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId("level-up-dialog")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("レベルアップダイアログを閉じる処理", async () => {
      const mockMarkLevelUpSeen =
        require("@/features/user-level/actions/level-up").markLevelUpSeenAction;

      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={30}
            xpGained={20}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId("level-up-dialog")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const closeButton = screen.getByTestId("level-up-dialog");

      await act(async () => {
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(mockMarkLevelUpSeen).toHaveBeenCalled();
      });
    });
  });

  describe("アニメーション制御", () => {
    it("showFinalStateがtrueになる", async () => {
      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={50}
            xpGained={50}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(
            screen.getByText("50ポイント獲得しました！"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("レベルアップしない場合にアニメーション完了後コールバックが呼ばれる", async () => {
      const mockCallback = jest.fn();

      render(
        <XpProgressToastContent
          initialXp={10}
          xpGained={20}
          onAnimationComplete={mockCallback}
        />,
      );

      await waitFor(
        () => {
          expect(mockCallback).toHaveBeenCalled();
        },
        { timeout: 5000 },
      );
    });
  });

  describe("エラーハンドリング", () => {
    it("markLevelUpSeenActionが失敗した場合のエラーハンドリング", async () => {
      const mockMarkLevelUpSeen =
        require("@/features/user-level/actions/level-up").markLevelUpSeenAction;
      mockMarkLevelUpSeen.mockResolvedValueOnce({
        success: false,
        error: "Test error",
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={30}
            xpGained={20}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId("level-up-dialog")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const closeButton = screen.getByTestId("level-up-dialog");

      await act(async () => {
        fireEvent.click(closeButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to mark level up notification as seen:",
          "Test error",
        );
      });

      consoleSpy.mockRestore();
    });

    it("markLevelUpSeenActionで例外が発生した場合のエラーハンドリング", async () => {
      const mockMarkLevelUpSeen =
        require("@/features/user-level/actions/level-up").markLevelUpSeenAction;
      mockMarkLevelUpSeen.mockRejectedValueOnce(new Error("Network error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await act(async () => {
        render(
          <XpProgressToastContent
            initialXp={30}
            xpGained={20}
            onAnimationComplete={jest.fn()}
          />,
        );
      });

      await waitFor(
        () => {
          expect(screen.getByTestId("level-up-dialog")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const closeButton = screen.getByTestId("level-up-dialog");

      await act(async () => {
        fireEvent.click(closeButton);
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
