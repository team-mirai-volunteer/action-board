import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { LevelUpDialog } from "./level-up-dialog";

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: any) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe("LevelUpDialog", () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    newLevel: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("基本的な表示", () => {
    it("ダイアログが正しく表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
    });

    it("レベルアップメッセージが表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByText("レベルアップ！")).toBeInTheDocument();
      expect(screen.getByText("レベル 5 に到達しました！")).toBeInTheDocument();
    });

    it("レベルアップメッセージが表示される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByText("レベル 5 に到達しました！")).toBeInTheDocument();
    });
  });

  describe("ダイアログの開閉", () => {
    it("isOpenがfalseの場合はダイアログが表示されない", () => {
      render(<LevelUpDialog {...mockProps} isOpen={false} />);

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });

    it("閉じるボタンをクリックするとonCloseが呼ばれる", () => {
      render(<LevelUpDialog {...mockProps} />);

      const closeButton = screen.getByRole("button", { name: "閉じる" });
      fireEvent.click(closeButton);

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("様々なレベル値", () => {
    it("レベル1の場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={1} />);

      expect(screen.getByText("レベル 1 に到達しました！")).toBeInTheDocument();
    });

    it("高いレベルの場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={50} />);

      expect(
        screen.getByText("レベル 50 に到達しました！"),
      ).toBeInTheDocument();
    });
  });

  describe("様々なレベル値", () => {
    it("レベル1の場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={1} />);

      expect(screen.getByText("レベル 1 に到達しました！")).toBeInTheDocument();
    });

    it("高いレベルの場合", () => {
      render(<LevelUpDialog {...mockProps} newLevel={50} />);

      expect(
        screen.getByText("レベル 50 に到達しました！"),
      ).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("ダイアログタイトルが適切に設定される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
    });

    it("ダイアログ説明が適切に設定される", () => {
      render(<LevelUpDialog {...mockProps} />);

      expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
    });
  });
});
