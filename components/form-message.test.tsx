import { render, screen } from "@testing-library/react";
import React from "react";
import { FormMessage } from "./form-message";

describe("FormMessage", () => {
  describe("基本的な表示", () => {
    it("メッセージが正しく表示される", () => {
      render(<FormMessage message={{ message: "テストメッセージ" }} />);

      expect(screen.getByText("テストメッセージ")).toBeInTheDocument();
    });

    it("メッセージがない場合は何も表示されない", () => {
      const { container } = render(<FormMessage message={null as any} />);

      expect(container.firstChild).toBeNull();
    });

    it("エラーメッセージタイプ", () => {
      render(<FormMessage message={{ error: "エラーが発生しました" }} />);

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("成功メッセージタイプ", () => {
      render(<FormMessage message={{ success: "成功しました" }} />);

      expect(screen.getByText("成功しました")).toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("エラーメッセージの適切なCSSクラスが設定される", () => {
      const { container } = render(
        <FormMessage message={{ error: "エラーメッセージ" }} />,
      );

      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass("bg-red-50", "border-red-200");

      const messageElement = screen.getByText("エラーメッセージ");
      expect(messageElement).toHaveClass("text-red-700");
    });

    it("成功メッセージの適切なCSSクラスが設定される", () => {
      const { container } = render(
        <FormMessage message={{ success: "成功メッセージ" }} />,
      );

      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass("bg-green-50", "border-green-200");

      const messageElement = screen.getByText("成功メッセージ");
      expect(messageElement).toHaveClass("text-green-700");
    });

    it("通常メッセージの適切なCSSクラスが設定される", () => {
      const { container } = render(
        <FormMessage message={{ message: "通常メッセージ" }} />,
      );

      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass("bg-blue-50", "border-blue-200");

      const messageElement = screen.getByText("通常メッセージ");
      expect(messageElement).toHaveClass("text-blue-700");
    });
  });

  describe("様々なメッセージタイプ", () => {
    it("長いメッセージの表示", () => {
      const longMessage =
        "これは非常に長いエラーメッセージのテストです。複数行にわたる可能性があります。";
      render(<FormMessage message={{ message: longMessage }} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("HTMLエンティティを含むメッセージ", () => {
      const messageWithEntities = "エラー: &lt;値&gt; が無効です";
      render(<FormMessage message={{ message: messageWithEntities }} />);

      expect(screen.getByText(messageWithEntities)).toBeInTheDocument();
    });

    it("空白文字を含むメッセージ", () => {
      const { container } = render(
        <FormMessage message={{ message: "空白を含む   メッセージ" }} />,
      );

      const messageElement = container.querySelector(
        '[class*="text-blue-700"]',
      );
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toHaveTextContent("空白を含む メッセージ");
    });
  });

  describe("レイアウト", () => {
    it("適切な構造でレンダリングされる", () => {
      const { container } = render(
        <FormMessage message={{ message: "テスト" }} />,
      );

      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass(
        "relative",
        "flex",
        "items-start",
        "gap-3",
      );
    });

    it("カスタムクラス名が適用される", () => {
      const { container } = render(
        <FormMessage
          message={{ message: "テスト" }}
          className="custom-class"
        />,
      );

      const messageContainer = container.firstChild;
      expect(messageContainer).toHaveClass("custom-class");
    });
  });
});
