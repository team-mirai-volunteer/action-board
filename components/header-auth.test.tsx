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

    it("サインアップリンクが表示される", async () => {
      render(await HeaderAuth());

      expect(
        screen.getByRole("link", { name: "サインアップ" }),
      ).toBeInTheDocument();
    });

    it("適切なリンク先が設定される", async () => {
      render(await HeaderAuth());

      const loginLink = screen.getByRole("link", { name: "ログイン" });
      const signupLink = screen.getByRole("link", { name: "サインアップ" });

      expect(loginLink).toHaveAttribute("href", "/sign-in");
      expect(signupLink).toHaveAttribute("href", "/sign-up");
    });
  });

  describe("認証状態", () => {
    beforeEach(() => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({
              data: {
                user: {
                  id: "test-user",
                  email: "test@example.com",
                },
              },
              error: null,
            }),
          ),
        },
      });
    });

    it("ユーザーメニューが表示される", async () => {
      render(await HeaderAuth());

      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("ログアウトボタンが表示される", async () => {
      render(await HeaderAuth());

      expect(
        screen.getByRole("button", { name: "ログアウト" }),
      ).toBeInTheDocument();
    });
  });

  describe("エラーハンドリング", () => {
    it("認証エラー時の処理", async () => {
      const mockCreateClient = require("@/lib/supabase/server").createClient;
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({
              data: { user: null },
              error: { message: "認証エラー" },
            }),
          ),
        },
      });

      render(await HeaderAuth());

      expect(
        screen.getByRole("link", { name: "ログイン" }),
      ).toBeInTheDocument();
    });
  });

  describe("レイアウト", () => {
    it("適切なCSSクラスが設定される", async () => {
      const { container } = render(await HeaderAuth());

      const authContainer = container.firstChild;
      expect(authContainer).toHaveClass("flex", "items-center", "gap-2");
    });
  });
});
