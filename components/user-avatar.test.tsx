import { render, screen } from "@testing-library/react";
import React from "react";
import UserAvatar from "./user-avatar";

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: "https://example.com/avatar.jpg" },
        })),
      })),
    },
  })),
}));

describe("UserAvatar", () => {
  describe("基本的な表示", () => {
    it("アバター画像が正しく表示される", () => {
      const { container } = render(
        <UserAvatar
          userProfile={{ name: "テストユーザー", avatar_url: "avatar.jpg" }}
          size="md"
        />,
      );

      const avatar = container.querySelector('[class*="relative flex"]');
      expect(avatar).toBeInTheDocument();
    });

    it("URLがない場合のデフォルト表示", () => {
      render(
        <UserAvatar
          userProfile={{ name: "テストユーザー", avatar_url: null }}
          size="md"
        />,
      );

      const fallback = screen.getByText("テ");
      expect(fallback).toBeInTheDocument();
    });

    it("異なるサイズでの表示", () => {
      const { container } = render(
        <UserAvatar
          userProfile={{ name: "テストユーザー", avatar_url: "avatar.jpg" }}
          size="lg"
        />,
      );

      const avatar = container.querySelector('[class*="w-16 h-16"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe("プロパティの処理", () => {
    it("名前からフォールバックが生成される", () => {
      render(
        <UserAvatar
          userProfile={{ name: "田中太郎", avatar_url: null }}
          size="md"
        />,
      );

      expect(screen.getByText("田")).toBeInTheDocument();
    });

    it("空文字列のURLの処理", () => {
      render(
        <UserAvatar
          userProfile={{ name: "テストユーザー", avatar_url: "" }}
          size="md"
        />,
      );

      const fallback = screen.getByText("テ");
      expect(fallback).toBeInTheDocument();
    });

    it("名前がない場合のデフォルトフォールバック", () => {
      render(
        <UserAvatar userProfile={{ name: null, avatar_url: null }} size="md" />,
      );

      expect(screen.getByText("ユ")).toBeInTheDocument();
    });
  });
});
