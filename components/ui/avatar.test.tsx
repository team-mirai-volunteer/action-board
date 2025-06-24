import { render, screen } from "@testing-library/react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

describe("Avatar Components", () => {
  describe("Avatar", () => {
    it("基本的なアバターが表示される", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage
            src="https://example.com/avatar.jpg"
            alt="テストアバター"
          />
          <AvatarFallback>TA</AvatarFallback>
        </Avatar>,
      );

      const avatar = container.querySelector('[class*="relative flex"]');
      expect(avatar).toBeInTheDocument();
    });

    it("適切なCSSクラスが設定される", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="test.jpg" alt="test" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>,
      );

      const avatar = container.firstChild;
      expect(avatar).toHaveClass("relative", "flex", "h-10", "w-10");
    });
  });

  describe("AvatarImage", () => {
    it("画像コンポーネントが正しく表示される", () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/test.jpg" alt="テスト画像" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>,
      );

      const avatarRoot = container.querySelector('[class*="relative flex"]');
      expect(avatarRoot).toBeInTheDocument();
    });

    it("フォールバックが表示される", () => {
      render(
        <Avatar>
          <AvatarImage src="invalid-url" alt="テスト画像" />
          <AvatarFallback>T</AvatarFallback>
        </Avatar>,
      );

      expect(screen.getByText("T")).toBeInTheDocument();
    });
  });

  describe("AvatarFallback", () => {
    it("フォールバックテキストが表示される", () => {
      render(
        <Avatar>
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );

      expect(screen.getByText("FB")).toBeInTheDocument();
    });

    it("フォールバックのスタイルが適用される", () => {
      render(
        <Avatar>
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>,
      );

      const fallback = screen.getByText("FB");
      expect(fallback).toHaveClass(
        "flex",
        "h-full",
        "w-full",
        "items-center",
        "justify-center",
      );
    });

    it("日本語のフォールバックテキスト", () => {
      render(
        <Avatar>
          <AvatarFallback>田中</AvatarFallback>
        </Avatar>,
      );

      expect(screen.getByText("田中")).toBeInTheDocument();
    });
  });

  describe("組み合わせパターン", () => {
    it("画像とフォールバックの組み合わせ", () => {
      render(
        <Avatar>
          <AvatarImage src="invalid-url.jpg" alt="無効な画像" />
          <AvatarFallback>無効</AvatarFallback>
        </Avatar>,
      );

      expect(screen.getByText("無効")).toBeInTheDocument();
    });

    it("カスタムクラス名の適用", () => {
      const { container } = render(
        <Avatar className="custom-avatar">
          <AvatarFallback>C</AvatarFallback>
        </Avatar>,
      );

      const avatar = container.firstChild;
      expect(avatar).toHaveClass("custom-avatar");
    });
  });
});
