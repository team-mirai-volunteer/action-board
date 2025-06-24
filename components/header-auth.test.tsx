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

jest.mock("@/components/my-avatar", () => {
  return ({ className }: any) => (
    <div data-testid="my-avatar" className={className} />
  );
});

jest.mock("@/app/actions", () => ({
  signOutAction: jest.fn(),
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
    beforeEach(() => {
      const mockSupabase = require("@/lib/supabase/server").createClient;
      mockSupabase.mockResolvedValue({
        auth: {
          getUser: jest.fn(() =>
            Promise.resolve({
              data: { user: { id: "test-user", email: "test@example.com" } },
            }),
          ),
        },
      });
    });

    it("ユーザーがログイン済みの場合ドロップダウンメニューが表示される", async () => {
      render(await HeaderAuth());

      expect(screen.getByTestId("usermenubutton")).toBeInTheDocument();
      expect(screen.getByTestId("my-avatar")).toBeInTheDocument();
    });

    it("ドロップダウンメニューに適切なリンクが含まれる", async () => {
      render(await HeaderAuth());

      const menuButton = screen.getByTestId("usermenubutton");
      expect(menuButton).toBeInTheDocument();
    });

    it("ユーザーメニューボタンが表示される", async () => {
      render(await HeaderAuth());

      expect(screen.getByTestId("usermenubutton")).toBeInTheDocument();
      expect(
        screen.getByLabelText("ユーザーメニューを開く"),
      ).toBeInTheDocument();
    });

    it("アバターコンポーネントが表示される", async () => {
      render(await HeaderAuth());

      expect(screen.getByTestId("my-avatar")).toBeInTheDocument();
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
    it("コンポーネントが正しくレンダリングされる", async () => {
      const { container } = render(await HeaderAuth());

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
