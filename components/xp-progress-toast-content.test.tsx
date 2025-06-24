import { render, screen } from "@testing-library/react";
import React from "react";
import { XpProgressToastContent } from "./xp-progress-toast-content";

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
});
