import { render, screen } from "@testing-library/react";
import React from "react";
import { EnvVarWarning } from "./env-var-warning";

describe("EnvVarWarning", () => {
  describe("基本的な表示", () => {
    it("環境変数警告メッセージが表示される", () => {
      render(<EnvVarWarning />);

      expect(
        screen.getByText("Supabase environment variables required"),
      ).toBeInTheDocument();
    });

    it("Sign inリンクが表示される", () => {
      render(<EnvVarWarning />);

      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });

    it("Sign upリンクが表示される", () => {
      render(<EnvVarWarning />);

      expect(screen.getByText("Sign up")).toBeInTheDocument();
    });
  });

  describe("レイアウト", () => {
    it("フレックスレイアウトが適用される", () => {
      const { container } = render(<EnvVarWarning />);

      const warningContainer = container.firstChild;
      expect(warningContainer).toHaveClass("flex", "gap-4", "items-center");
    });

    it("リンクが正しく設定される", () => {
      render(<EnvVarWarning />);

      const signInLink = screen.getByRole("link", { name: "Sign in" });
      const signUpLink = screen.getByRole("link", { name: "Sign up" });

      expect(signInLink).toHaveAttribute("href", "/sign-in");
      expect(signUpLink).toHaveAttribute("href", "/sign-up");
    });
  });

  describe("状態", () => {
    it("ボタンが無効化されている", () => {
      render(<EnvVarWarning />);

      const signInLink = screen.getByRole("link", { name: "Sign in" });
      const signUpLink = screen.getByRole("link", { name: "Sign up" });

      expect(signInLink).toHaveAttribute("disabled");
      expect(signUpLink).toHaveAttribute("disabled");
    });
  });
});
