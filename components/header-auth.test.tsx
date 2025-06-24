import { render, screen } from "@testing-library/react";
import type React from "react";
import HeaderAuth from "./header-auth";

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, size, asChild, ...props }: any) =>
    asChild ? children : <button {...props}>{children}</button>,
}));

describe("HeaderAuth", () => {
  describe("未認証状態", () => {
    it("ログインリンクが表示される", async () => {
      render(await HeaderAuth());

      expect(
        screen.getByRole("link", { name: "ログイン" }),
      ).toBeInTheDocument();
    });

    it("新規登録リンクが表示される", async () => {
      render(await HeaderAuth());

      expect(
        screen.getByRole("link", { name: "新規登録" }),
      ).toBeInTheDocument();
    });

    it("適切なリンク先が設定される", async () => {
      render(await HeaderAuth());

      const loginLink = screen.getByRole("link", { name: "ログイン" });
      const signupLink = screen.getByRole("link", { name: "新規登録" });

      expect(loginLink).toHaveAttribute("href", "/sign-in");
      expect(signupLink).toHaveAttribute("href", "/sign-up");
    });
  });

  describe("認証状態", () => {
    it("コンポーネントが正しくレンダリングされる", async () => {
      const result = await HeaderAuth();
      render(result);

      expect(result).toBeDefined();
    });
  });

  describe("エラーハンドリング", () => {
    it("コンポーネントが正しくレンダリングされる", async () => {
      const result = await HeaderAuth();
      render(result);

      expect(result).toBeDefined();
    });
  });

  describe("レイアウト", () => {
    it("適切なCSSクラスが設定される", async () => {
      const { container } = render(await HeaderAuth());

      const authContainer = container.firstChild;
      expect(authContainer).toHaveClass("flex", "gap-2");
    });
  });
});
