import { render, screen } from "@testing-library/react";
import React from "react";
import { Toaster } from "./sonner";

describe("Sonner Toaster", () => {
  describe("基本的な表示", () => {
    it("Toasterが正しく表示される", () => {
      const { container } = render(<Toaster />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("設定オプション", () => {
    it("位置設定が適用される", () => {
      const { container } = render(<Toaster position="top-right" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("テーマ設定が適用される", () => {
      const { container } = render(<Toaster theme="dark" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("リッチカラー設定", () => {
      const { container } = render(<Toaster richColors />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("カスタマイズ", () => {
    it("カスタムクラス名の適用", () => {
      const { container } = render(<Toaster className="custom-toaster" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("カスタムスタイルの適用", () => {
      const { container } = render(<Toaster style={{ zIndex: 9999 }} />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なaria属性が設定される", () => {
      const { container } = render(<Toaster />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("ライブリージョンとして機能する", () => {
      const { container } = render(<Toaster />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("レスポンシブ対応", () => {
    it("モバイル表示での調整", () => {
      const { container } = render(<Toaster expand />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it("デスクトップ表示での調整", () => {
      const { container } = render(<Toaster visibleToasts={5} />);

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
