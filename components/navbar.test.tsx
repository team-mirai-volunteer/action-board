import { render, screen } from "@testing-library/react";
import type React from "react";
import Navbar from "./navbar";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/header-auth", () => {
  return function MockHeaderAuth() {
    return <div data-testid="header-auth">Header Auth</div>;
  };
});

jest.mock("next/image", () => {
  return ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  );
});

describe("Navbar", () => {
  describe("基本的な表示", () => {
    it("ナビゲーションバーが正しくレンダリングされる", async () => {
      render(await Navbar());

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("ロゴリンクが表示される", async () => {
      render(await Navbar());

      const logoLinks = screen.getAllByRole("link", {
        name: /logo|アクションボード/,
      });
      expect(logoLinks[0]).toHaveAttribute("href", "/");
    });

    it("アクションボードテキストが表示される", async () => {
      render(await Navbar());

      expect(screen.getByText("アクションボード")).toBeInTheDocument();
    });
  });

  describe("レスポンシブ表示", () => {
    it("ナビゲーション要素が存在する", async () => {
      render(await Navbar());

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("適切なCSSクラスが設定される", async () => {
      const { container } = render(await Navbar());

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("border-b");
    });
  });

  describe("アクセシビリティ", () => {
    it("ナビゲーションロールが設定される", async () => {
      render(await Navbar());

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("リンクが適切に設定される", async () => {
      render(await Navbar());

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
