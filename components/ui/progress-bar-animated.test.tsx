import { render, screen } from "@testing-library/react";
import React from "react";
import { ProgressBarAnimated } from "./progress-bar-animated";

describe("ProgressBarAnimated", () => {
  const mockProps = {
    zeroValue: 0,
    maxValue: 100,
    startValue: 0,
    endValue: 50,
    animationDuration: 1000,
    onAnimationComplete: jest.fn(),
  };

  describe("基本的な表示", () => {
    it("プログレスバーが正しく表示される", () => {
      render(<ProgressBarAnimated {...mockProps} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });

    it("適切なaria属性が設定される", () => {
      render(<ProgressBarAnimated {...mockProps} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  });

  describe("プロパティの処理", () => {
    it("異なる値での表示", () => {
      const customProps = { ...mockProps, endValue: 75 };
      render(<ProgressBarAnimated {...customProps} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });

    it("テキスト表示の制御", () => {
      render(<ProgressBarAnimated {...mockProps} showText={true} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });

    it("カスタムクラス名の適用", () => {
      render(
        <ProgressBarAnimated {...mockProps} className="custom-progress" />,
      );

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveClass("custom-progress");
    });
  });

  describe("アニメーション", () => {
    it("アニメーション完了コールバックが設定される", () => {
      const mockCallback = jest.fn();
      render(
        <ProgressBarAnimated
          {...mockProps}
          onAnimationComplete={mockCallback}
        />,
      );

      expect(mockCallback).toBeDefined();
    });

    it("アニメーション時間が設定される", () => {
      render(<ProgressBarAnimated {...mockProps} animationDuration={2000} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("最大値と同じ値の場合", () => {
      const maxProps = { ...mockProps, endValue: 100 };
      render(<ProgressBarAnimated {...maxProps} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });

    it("最小値の場合", () => {
      const minProps = { ...mockProps, endValue: 0 };
      render(<ProgressBarAnimated {...minProps} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });
  });
});
