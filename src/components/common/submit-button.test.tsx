import { fireEvent, render, screen } from "@testing-library/react";
import { SubmitButton } from "./submit-button";

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, type, onClick, ...props }: any) => {
    const handleClick = (e: any) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      if (onClick) onClick(e);
    };

    return (
      <button disabled={disabled} type={type} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
}));

describe("SubmitButton", () => {
  describe("基本的な表示", () => {
    it("ボタンが正しく表示される", () => {
      render(<SubmitButton>送信</SubmitButton>);

      expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
    });

    it("type属性がsubmitに設定される", () => {
      render(<SubmitButton>送信</SubmitButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("pending状態", () => {
    it("pending時は無効化される", () => {
      const mockUseFormStatus = require("react-dom").useFormStatus;
      mockUseFormStatus.mockReturnValue({ pending: true });

      render(<SubmitButton pendingText="送信中...">送信</SubmitButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("pending時はpendingTextが表示される", () => {
      const mockUseFormStatus = require("react-dom").useFormStatus;
      mockUseFormStatus.mockReturnValue({ pending: true });

      render(<SubmitButton pendingText="送信中...">送信</SubmitButton>);

      expect(screen.getByText("送信中...")).toBeInTheDocument();
    });

    it("pendingTextがない場合はデフォルトテキストが表示される", () => {
      const mockUseFormStatus = require("react-dom").useFormStatus;
      mockUseFormStatus.mockReturnValue({ pending: true });

      render(<SubmitButton>送信</SubmitButton>);

      expect(screen.getByText("Submitting...")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("クリックイベントが発火する", () => {
      const mockClick = jest.fn();
      render(<SubmitButton onClick={mockClick}>送信</SubmitButton>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it("disabled時はクリックイベントが発火しない", () => {
      const mockClick = jest.fn();
      render(
        <SubmitButton onClick={mockClick} disabled>
          送信中...
        </SubmitButton>,
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      fireEvent.click(button);

      expect(mockClick).not.toHaveBeenCalled();
    });
  });

  describe("プロパティ", () => {
    it("その他のpropsが渡される", () => {
      render(<SubmitButton data-testid="submit-btn">送信</SubmitButton>);

      expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
    });
  });
});
