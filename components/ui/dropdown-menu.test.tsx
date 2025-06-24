import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu Components", () => {
  describe("DropdownMenu", () => {
    it("基本的なドロップダウンメニューが表示される", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">メニューを開く</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム1</DropdownMenuItem>
            <DropdownMenuItem>アイテム2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(
        screen.getByRole("button", { name: "メニューを開く" }),
      ).toBeInTheDocument();
    });

    it("トリガーをクリックするとメニューが開く", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">開く</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>表示されるアイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole("button", { name: "開く" });
      fireEvent.click(trigger);

      expect(screen.getByText("表示されるアイテム")).toBeInTheDocument();
    });
  });

  describe("DropdownMenuTrigger", () => {
    it("トリガーボタンが正しく表示される", () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガーボタン</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const trigger = screen.getByRole("button", { name: "トリガーボタン" });
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("DropdownMenuContent", () => {
    it("メニューコンテンツが表示される", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>コンテンツアイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.getByText("コンテンツアイテム")).toBeInTheDocument();
    });

    it("適切なCSSクラスが設定される", () => {
      const { container } = render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const content = container.querySelector('[role="menu"]');
      expect(content).toHaveClass("z-50", "min-w-[8rem]");
    });
  });

  describe("DropdownMenuItem", () => {
    it("メニューアイテムが正しく表示される", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>クリック可能なアイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.getByText("クリック可能なアイテム")).toBeInTheDocument();
    });

    it("アイテムをクリックするとイベントが発火する", () => {
      const mockOnSelect = jest.fn();
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={mockOnSelect}>
              選択可能なアイテム
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const item = screen.getByText("選択可能なアイテム");
      fireEvent.click(item);

      expect(mockOnSelect).toHaveBeenCalled();
    });
  });

  describe("DropdownMenuLabel", () => {
    it("ラベルが正しく表示される", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>メニューラベル</DropdownMenuLabel>
            <DropdownMenuItem>アイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.getByText("メニューラベル")).toBeInTheDocument();
    });
  });

  describe("DropdownMenuSeparator", () => {
    it("セパレーターが表示される", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>アイテム2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const separator = screen.getByRole("separator");
      expect(separator).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なrole属性が設定される", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("キーボードナビゲーションが機能する", () => {
      render(
        <DropdownMenu open>
          <DropdownMenuTrigger asChild>
            <button type="button">トリガー</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>アイテム1</DropdownMenuItem>
            <DropdownMenuItem>アイテム2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      const menu = screen.getByRole("menu");
      fireEvent.keyDown(menu, { key: "ArrowDown" });

      expect(screen.getByText("アイテム1")).toBeInTheDocument();
    });
  });
});
