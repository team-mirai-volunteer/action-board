import { render, screen } from "@testing-library/react";
import type React from "react";
import Hero from "./hero";

jest.mock("@/features/user-profile/services/profile", () => ({
  getUser: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("@/features/user-level/components/levels", () => {
  return function MockLevels({ userId, clickable }: any) {
    return <div data-testid="levels">Levels Component for {userId}</div>;
  };
});

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
    it("ヒーローセクションが正しくレンダリングされる", async () => {
      const result = await Hero();
      render(result);

      expect(screen.getByText("アクションボード")).toBeInTheDocument();
      expect(
        screen.getByText(
          "テクノロジーで政治をかえる。あなたと一緒に未来をつくる。",
        ),
      ).toBeInTheDocument();
    });

    it("メインタイトルが表示される", async () => {
      const result = await Hero();
      render(result);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("説明文が表示される", async () => {
      const result = await Hero();
      render(result);

      expect(
        screen.getByText(/テクノロジーで政治をかえる/),
      ).toBeInTheDocument();
    });
  });

  describe("CTA要素", () => {
    it("開始ボタンが表示される", async () => {
      const result = await Hero();
      render(result);

      const startButton = screen.getByRole("button", {
        name: /アクションボードに登録する/,
      });
      expect(startButton).toBeInTheDocument();
    });

    it("詳細リンクが表示される", async () => {
      const result = await Hero();
      render(result);

      const detailLink = screen.getByRole("link");
      expect(detailLink).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("見出し階層が適切に設定される", async () => {
      const result = await Hero();
      render(result);

      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    it("ボタンとリンクが適切に設定される", async () => {
      const result = await Hero();
      render(result);

      const buttons = screen.getAllByRole("button");
      const links = screen.getAllByRole("link");

      expect(buttons.length).toBeGreaterThan(0);
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
