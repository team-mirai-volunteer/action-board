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

  describe("ボタン", () => {
    it("ボタンが正しく表示される", () => {
      render(<EnvVarWarning />);

      const signInButton = screen.getByRole("button", { name: "Sign in" });
      const signUpButton = screen.getByRole("button", { name: "Sign up" });

      expect(signInButton).toBeInTheDocument();
      expect(signUpButton).toBeInTheDocument();
    });
  });

  describe("状態", () => {
    it("ボタンが無効化されている", () => {
      render(<EnvVarWarning />);

      const signInButton = screen.getByRole("button", { name: "Sign in" });
      const signUpButton = screen.getByRole("button", { name: "Sign up" });

      expect(signInButton).toHaveAttribute("aria-disabled", "true");
      expect(signUpButton).toHaveAttribute("aria-disabled", "true");
    });
  });
});
