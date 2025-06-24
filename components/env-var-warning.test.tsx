import { render, screen } from "@testing-library/react";
import React from "react";
import { EnvVarWarning } from "./env-var-warning";

describe("EnvVarWarning", () => {
  describe("基本的な表示", () => {
    it("警告メッセージが正しく表示される", () => {
      render(<EnvVarWarning />);

      expect(
        screen.getByText("環境変数が設定されていません"),
      ).toBeInTheDocument();
    });

    it("詳細説明が表示される", () => {
      render(<EnvVarWarning />);

      expect(
        screen.getByText(/必要な環境変数を設定してください/),
      ).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("警告用のCSSクラスが設定される", () => {
      const { container } = render(<EnvVarWarning />);

      const warningElement = container.firstChild;
      expect(warningElement).toHaveClass("bg-yellow-50", "border-yellow-200");
    });

    it("警告アイコンが表示される", () => {
      render(<EnvVarWarning />);

      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });
  });

  describe("レイアウト", () => {
    it("適切なパディングとマージンが設定される", () => {
      const { container } = render(<EnvVarWarning />);

      const warningContainer = container.firstChild;
      expect(warningContainer).toHaveClass("p-4", "rounded-md", "border");
    });

    it("フレックスレイアウトが適用される", () => {
      const { container } = render(<EnvVarWarning />);

      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("警告として認識される", () => {
      render(<EnvVarWarning />);

      const warningElement = screen.getByRole("alert");
      expect(warningElement).toBeInTheDocument();
    });

    it("適切なaria-labelが設定される", () => {
      render(<EnvVarWarning />);

      const warningElement = screen.getByRole("alert");
      expect(warningElement).toHaveAttribute("aria-label", "環境変数警告");
    });
  });
});
