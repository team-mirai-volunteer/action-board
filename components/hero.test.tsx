import { render, screen } from "@testing-library/react";
import type React from "react";
import Hero from "./hero";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className, variant, size, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

describe("Hero", () => {
  describe("基本的な表示", () => {
    it("ヒーローセクションが正しくレンダリングされる", () => {
      render(<Hero />);

      expect(screen.getByText("政治参加を")).toBeInTheDocument();
      expect(screen.getByText("ゲームのように楽しく")).toBeInTheDocument();
    });

    it("メインタイトルが表示される", () => {
      render(<Hero />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("説明文が表示される", () => {
      render(<Hero />);

      expect(screen.getByText(/アクションボードは/)).toBeInTheDocument();
    });
  });

  describe("CTA要素", () => {
    it("開始ボタンが表示される", () => {
      render(<Hero />);

      const startButton = screen.getByRole("button", { name: /始める/ });
      expect(startButton).toBeInTheDocument();
    });

    it("詳細リンクが表示される", () => {
      render(<Hero />);

      const detailLink = screen.getByRole("link");
      expect(detailLink).toBeInTheDocument();
    });
  });

  describe("レイアウトとスタイル", () => {
    it("適切なCSSクラスが設定される", () => {
      const { container } = render(<Hero />);

      const heroSection = container.querySelector("section");
      expect(heroSection).toHaveClass("py-20");
    });

    it("グラデーション背景が設定される", () => {
      const { container } = render(<Hero />);

      const gradientElement = container.querySelector(".bg-gradient-to-r");
      expect(gradientElement).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("見出し階層が適切に設定される", () => {
      render(<Hero />);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it("ボタンとリンクが適切に設定される", () => {
      render(<Hero />);

      const buttons = screen.getAllByRole("button");
      const links = screen.getAllByRole("link");

      expect(buttons.length).toBeGreaterThan(0);
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
