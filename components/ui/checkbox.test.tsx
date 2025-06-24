import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  describe("基本的な表示", () => {
    it("チェックボックスが正しく表示される", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("ラベル付きチェックボックス", () => {
      render(
        <div>
          <Checkbox id="test-checkbox" />
          <label htmlFor="test-checkbox">テストラベル</label>
        </div>,
      );

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("テストラベル")).toBeInTheDocument();
    });
  });

  describe("状態管理", () => {
    it("チェック状態の切り替え", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("初期チェック状態", () => {
      render(<Checkbox defaultChecked />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("無効状態", () => {
      render(<Checkbox disabled />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeDisabled();
    });
  });

  describe("イベントハンドリング", () => {
    it("onChange イベントが発火する", () => {
      const mockOnChange = jest.fn();
      render(<Checkbox onCheckedChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).toHaveBeenCalledWith(true);
    });

    it("無効状態ではイベントが発火しない", () => {
      const mockOnChange = jest.fn();
      render(<Checkbox disabled onCheckedChange={mockOnChange} />);

      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("スタイリング", () => {
    it("適切なCSSクラスが設定される", () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("peer");
    });

    it("カスタムクラス名の適用", () => {
      render(<Checkbox className="custom-checkbox" />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-checkbox");
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なrole属性が設定される", () => {
      render(<Checkbox />);

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("aria-checked属性が正しく設定される", () => {
      render(<Checkbox checked />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });
  });
});
