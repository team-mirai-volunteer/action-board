import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog Components", () => {
  describe("Dialog", () => {
    it("基本的なダイアログが表示される", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>テストタイトル</DialogTitle>
              <DialogDescription>テスト説明</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("テストタイトル")).toBeInTheDocument();
      expect(screen.getByText("テスト説明")).toBeInTheDocument();
    });

    it("閉じた状態では表示されない", () => {
      render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>非表示タイトル</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.queryByText("非表示タイトル")).not.toBeInTheDocument();
    });
  });

  describe("DialogTrigger", () => {
    it("トリガーボタンが表示される", () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">ダイアログを開く</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>ダイアログ内容</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      expect(
        screen.getByRole("button", { name: "ダイアログを開く" }),
      ).toBeInTheDocument();
    });

    it("トリガーをクリックするとダイアログが開く", () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <button type="button">開く</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>開かれたダイアログ</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      const trigger = screen.getByRole("button", { name: "開く" });
      fireEvent.click(trigger);

      expect(screen.getByText("開かれたダイアログ")).toBeInTheDocument();
    });
  });

  describe("DialogContent", () => {
    it("コンテンツが正しく表示される", () => {
      render(
        <Dialog open>
          <DialogContent>
            <div>ダイアログコンテンツ</div>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("ダイアログコンテンツ")).toBeInTheDocument();
    });

    it("適切なCSSクラスが設定される", () => {
      const { container } = render(
        <Dialog open>
          <DialogContent>
            <div>コンテンツ</div>
          </DialogContent>
        </Dialog>,
      );

      const content = container.querySelector('[role="dialog"]');
      expect(content).toHaveClass("fixed", "left-[50%]", "top-[50%]");
    });
  });

  describe("DialogHeader", () => {
    it("ヘッダーが正しく表示される", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ヘッダータイトル</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByText("ヘッダータイトル")).toBeInTheDocument();
    });
  });

  describe("DialogTitle", () => {
    it("タイトルが見出しとして表示される", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>ダイアログタイトル</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      expect(
        screen.getByRole("heading", { name: "ダイアログタイトル" }),
      ).toBeInTheDocument();
    });
  });

  describe("DialogDescription", () => {
    it("説明文が正しく表示される", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogDescription>これはダイアログの説明です。</DialogDescription>
          </DialogContent>
        </Dialog>,
      );

      expect(
        screen.getByText("これはダイアログの説明です。"),
      ).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なrole属性が設定される", () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>アクセシブルダイアログ</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("Escapeキーでダイアログが閉じる", () => {
      const mockOnOpenChange = jest.fn();
      render(
        <Dialog open onOpenChange={mockOnOpenChange}>
          <DialogContent>
            <DialogTitle>閉じられるダイアログ</DialogTitle>
          </DialogContent>
        </Dialog>,
      );

      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
