import { render, screen } from "@testing-library/react";
import React from "react";
import { ProgressBarSimple } from "./progress-bar-simple";

describe("ProgressBarSimple", () => {
  describe("基本的な表示", () => {
    it("プログレスバーが正しく表示される", () => {
      const { container } = render(<ProgressBarSimple currentXp={50} />);

      const progressBar = container.querySelector('[class*="bg-gray-200"]');
      expect(progressBar).toBeInTheDocument();
    });

    it("プログレスバーの構造が正しい", () => {
      const { container } = render(<ProgressBarSimple currentXp={75} />);

      const progressContainer = container.querySelector(".bg-gray-200");
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe("値の処理", () => {
    it("0の場合", () => {
      render(<ProgressBarSimple currentXp={0} />);

      expect(screen.getByText("次のレベルまで")).toBeInTheDocument();
    });

    it("正の値の場合", () => {
      render(<ProgressBarSimple currentXp={100} />);

      expect(screen.getByText("次のレベルまで")).toBeInTheDocument();
    });

    it("中間値の場合", () => {
      render(<ProgressBarSimple currentXp={42} />);

      expect(screen.getByText("次のレベルまで")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("適切なCSSクラスが設定される", () => {
      const { container } = render(<ProgressBarSimple currentXp={50} />);

      const progressContainer = container.querySelector(".w-full");
      expect(progressContainer).toBeInTheDocument();
    });

    it("カスタムクラス名の適用", () => {
      const { container } = render(
        <ProgressBarSimple currentXp={50} className="custom-progress" />,
      );

      const progressContainer = container.querySelector(".custom-progress");
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("負の値の場合", () => {
      render(<ProgressBarSimple currentXp={-10} />);

      expect(screen.getByText("次のレベルまで")).toBeInTheDocument();
    });

    it("大きな値の場合", () => {
      render(<ProgressBarSimple currentXp={1500} />);

      expect(screen.getByText("次のレベルまで")).toBeInTheDocument();
    });
  });

  describe("テキスト表示", () => {
    it("showTextがtrueの場合テキストが表示される", () => {
      render(<ProgressBarSimple currentXp={50} showText={true} />);

      expect(screen.getByText("次のレベルまで")).toBeInTheDocument();
    });

    it("showTextがfalseの場合テキストが非表示", () => {
      render(<ProgressBarSimple currentXp={50} showText={false} />);

      expect(screen.queryByText("次のレベルまで")).not.toBeInTheDocument();
    });
  });
});
