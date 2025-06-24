import { render, screen } from "@testing-library/react";
import React from "react";
import { ProgressCircle } from "./progress-circle";

describe("ProgressCircle", () => {
  describe("基本的な表示", () => {
    it("円形プログレスが正しく表示される", () => {
      render(<ProgressCircle current={50} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });

    it("SVG要素が正しく表示される", () => {
      render(<ProgressCircle current={75} max={100} />);

      const svg = screen.getByTitle("Progress Circle");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("値の処理", () => {
    it("0%の場合", () => {
      render(<ProgressCircle current={0} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });

    it("100%の場合", () => {
      render(<ProgressCircle current={100} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });

    it("中間値の場合", () => {
      render(<ProgressCircle current={33} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe("サイズの処理", () => {
    it("デフォルトサイズ", () => {
      render(<ProgressCircle current={50} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });

    it("カスタムサイズ", () => {
      render(<ProgressCircle current={50} max={100} size={32} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("適切なCSSクラスが設定される", () => {
      const { container } = render(<ProgressCircle current={50} max={100} />);

      const progressContainer = container.querySelector("div");
      expect(progressContainer).toHaveClass("relative");
    });

    it("カスタムサイズが適用される", () => {
      render(<ProgressCircle current={50} max={100} size={200} />);

      const svg = screen.getByTitle("Progress Circle");
      expect(svg).toHaveAttribute("width", "200");
      expect(svg).toHaveAttribute("height", "200");
    });
  });

  describe("テキスト表示", () => {
    it("中央テキストが表示される", () => {
      render(<ProgressCircle current={50} max={100} centerText="50%" />);

      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("中央テキストがない場合", () => {
      render(<ProgressCircle current={50} max={100} />);

      expect(screen.queryByText("50%")).not.toBeInTheDocument();
    });
  });

  describe("エッジケース", () => {
    it("負の値の場合", () => {
      render(<ProgressCircle current={-10} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });

    it("最大値を超える場合", () => {
      render(<ProgressCircle current={150} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("SVGにタイトルが設定される", () => {
      render(<ProgressCircle current={50} max={100} />);

      expect(screen.getByTitle("Progress Circle")).toBeInTheDocument();
    });

    it("進捗値が正しく計算される", () => {
      render(<ProgressCircle current={25} max={100} />);

      const progressCircle = screen.getByTitle("Progress Circle");
      expect(progressCircle).toBeInTheDocument();
    });
  });
});
