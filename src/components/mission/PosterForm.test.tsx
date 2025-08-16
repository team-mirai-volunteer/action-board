import { fireEvent, render, screen } from "@testing-library/react";
import { PosterForm } from "./PosterForm";

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevron-down" />,
  Check: () => <div data-testid="check" />,
}));

// Mock UI components
jest.mock("@/components/ui/select", () => {
  const { useState } = require("react");
  return {
    Select: ({ children, value, onValueChange, disabled }: any) => {
      const [internalValue, setInternalValue] = useState(value || "");
      return (
        <div
          data-testid="select"
          data-value={internalValue}
          data-disabled={disabled}
        >
          <button
            type="button"
            onClick={() => {
              if (onValueChange && !disabled) {
                const newValue = "東京都";
                setInternalValue(newValue);
                onValueChange(newValue);
              }
            }}
          >
            Select Prefecture
          </button>
          {children}
        </div>
      );
    },
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => (
      <div data-value={value}>{children}</div>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
  };
});

describe("PosterForm", () => {
  it("renders all required fields", () => {
    render(<PosterForm disabled={false} />);

    // 必須フィールドの確認
    expect(
      screen.getByRole("button", { name: /Select Prefecture/i }),
    ).toBeInTheDocument(); // Selectボタンの存在確認
    expect(screen.getByLabelText(/市町村＋区/)).toBeInTheDocument();
    expect(screen.getByLabelText(/番号/)).toBeInTheDocument();

    // 必須マークの確認
    expect(screen.getAllByText("*")).toHaveLength(3);
  });

  it("renders all optional fields", () => {
    render(<PosterForm disabled={false} />);

    // オプショナルフィールドの確認
    expect(screen.getByLabelText("名前")).toBeInTheDocument();
    expect(screen.getByLabelText("状況")).toBeInTheDocument();
    expect(screen.getByLabelText("住所")).toBeInTheDocument();
    expect(screen.getByLabelText("緯度")).toBeInTheDocument();
    expect(screen.getByLabelText("経度")).toBeInTheDocument();
  });

  it("disables all inputs when disabled prop is true", () => {
    render(<PosterForm disabled={true} />);

    // すべての入力フィールドが無効化されていることを確認
    expect(screen.getByTestId("select")).toHaveAttribute(
      "data-disabled",
      "true",
    );
    expect(screen.getByRole("textbox", { name: /市町村＋区/ })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /番号/ })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /名前/ })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /状況/ })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /住所/ })).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: /緯度/ })).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: /経度/ })).toBeDisabled();
  });

  it("enables all inputs when disabled prop is false", () => {
    render(<PosterForm disabled={false} />);

    // すべての入力フィールドが有効化されていることを確認
    expect(screen.getByTestId("select")).toHaveAttribute(
      "data-disabled",
      "false",
    );
    expect(
      screen.getByRole("textbox", { name: /市町村＋区/ }),
    ).not.toBeDisabled();
    expect(screen.getByRole("textbox", { name: /番号/ })).not.toBeDisabled();
    expect(screen.getByRole("textbox", { name: /名前/ })).not.toBeDisabled();
    expect(screen.getByRole("textbox", { name: /状況/ })).not.toBeDisabled();
    expect(screen.getByRole("textbox", { name: /住所/ })).not.toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: /緯度/ })).not.toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: /経度/ })).not.toBeDisabled();
  });

  it("has correct input attributes for city field", () => {
    render(<PosterForm disabled={false} />);

    const cityInput = screen.getByRole("textbox", { name: /市町村＋区/ });
    expect(cityInput).toHaveAttribute("type", "text");
    expect(cityInput).toHaveAttribute("name", "city");
    expect(cityInput).toHaveAttribute("maxLength", "100");
    expect(cityInput).toBeRequired();
  });

  it("has correct input attributes for board number field", () => {
    render(<PosterForm disabled={false} />);

    const boardNumberInput = screen.getByRole("textbox", { name: /番号/ });
    expect(boardNumberInput).toHaveAttribute("type", "text");
    expect(boardNumberInput).toHaveAttribute("name", "boardNumber");
    expect(boardNumberInput).toHaveAttribute("maxLength", "20");
    expect(boardNumberInput).toHaveAttribute("pattern", "^(\\d+(-\\d){0,2})$");
    expect(boardNumberInput).toBeRequired();
  });

  it("has correct input attributes for optional fields", () => {
    render(<PosterForm disabled={false} />);

    // 名前フィールド
    const nameInput = screen.getByRole("textbox", { name: /名前/ });
    expect(nameInput).toHaveAttribute("name", "boardName");
    expect(nameInput).toHaveAttribute("maxLength", "100");
    expect(nameInput).not.toBeRequired();

    // 状況フィールド
    const noteInput = screen.getByRole("textbox", { name: /状況/ });
    expect(noteInput).toHaveAttribute("name", "boardNote");
    expect(noteInput).toHaveAttribute("maxLength", "200");
    expect(noteInput).not.toBeRequired();

    // 住所フィールド
    const addressInput = screen.getByRole("textbox", { name: /住所/ });
    expect(addressInput).toHaveAttribute("name", "boardAddress");
    expect(addressInput).toHaveAttribute("maxLength", "200");
    expect(addressInput).not.toBeRequired();
  });

  it("has correct input attributes for coordinate fields", () => {
    render(<PosterForm disabled={false} />);

    // 緯度フィールド
    const latInput = screen.getByRole("spinbutton", { name: /緯度/ });
    expect(latInput).toHaveAttribute("type", "number");
    expect(latInput).toHaveAttribute("name", "boardLat");
    expect(latInput).toHaveAttribute("min", "-90");
    expect(latInput).toHaveAttribute("max", "90");
    expect(latInput).toHaveAttribute("step", "any");
    expect(latInput).not.toBeRequired();

    // 経度フィールド
    const longInput = screen.getByRole("spinbutton", { name: /経度/ });
    expect(longInput).toHaveAttribute("type", "number");
    expect(longInput).toHaveAttribute("name", "boardLong");
    expect(longInput).toHaveAttribute("min", "-180");
    expect(longInput).toHaveAttribute("max", "180");
    expect(longInput).toHaveAttribute("step", "any");
    expect(longInput).not.toBeRequired();
  });

  it("displays help text for all fields", () => {
    render(<PosterForm disabled={false} />);

    // ヘルプテキストの確認
    expect(
      screen.getByText(/市町村名と区名を入力してください/),
    ).toBeInTheDocument();
    expect(screen.getByText(/番号を入力してください/)).toBeInTheDocument();
    expect(
      screen.getByText(/場所の目印があれば入力してください/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /ポスター掲示板の状況について特記事項があれば入力してください/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/詳細な住所がわかれば入力してください/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/正確な位置情報がわかれば入力してください/),
    ).toBeInTheDocument();
  });

  it("displays placeholder text for all fields", () => {
    render(<PosterForm disabled={false} />);

    // プレースホルダーテキストの確認
    expect(
      screen.getByPlaceholderText("例：渋谷区、名古屋市中区"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("例：10-1、27-2-1、00"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("例：東小学校前、駅前商店街"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "例：破損していました、古いポスターが貼られていました",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("例：東京都渋谷区神南1-1-1"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：35.6762")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：139.6503")).toBeInTheDocument();
  });

  it("updates prefecture state when selection changes", () => {
    render(<PosterForm disabled={false} />);

    const selectComponent = screen.getByTestId("select");
    expect(selectComponent).toHaveAttribute("data-value", "");

    // 都道府県選択をシミュレート
    const selectButton = screen.getByText("Select Prefecture");
    fireEvent.click(selectButton);

    // 選択後の状態確認（モックでは東京都が選択される）
    expect(selectComponent).toHaveAttribute("data-value", "東京都");
  });

  it("renders hidden input for prefecture", () => {
    render(<PosterForm disabled={false} />);

    // 隠しinputフィールドの存在確認
    const hiddenInput = document.querySelector(
      'input[name="prefecture"][type="hidden"]',
    );
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute("name", "prefecture");
    expect(hiddenInput).toHaveAttribute("type", "hidden");
  });

  it("renders with correct form structure", () => {
    render(<PosterForm disabled={false} />);

    // フォーム構造の確認
    const formContainer = screen.getByTestId("select").closest(".space-y-4");
    expect(formContainer).toBeInTheDocument();

    // 各フィールドがラベルと一緒にレンダリングされていることを確認
    expect(
      screen.getByRole("textbox", { name: /市町村＋区/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /番号/ })).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<PosterForm disabled={false} />);

    // アクセシビリティ属性の確認

    const cityInput = screen.getByRole("textbox", { name: /市町村＋区/ });
    expect(cityInput).toHaveAttribute("id", "city");

    const boardNumberInput = screen.getByRole("textbox", { name: /番号/ });
    expect(boardNumberInput).toHaveAttribute("id", "boardNumber");

    const boardNameInput = screen.getByRole("textbox", { name: /名前/ });
    expect(boardNameInput).toHaveAttribute("id", "boardName");

    const boardNoteInput = screen.getByRole("textbox", { name: /状況/ });
    expect(boardNoteInput).toHaveAttribute("id", "boardNote");

    const boardAddressInput = screen.getByRole("textbox", { name: /住所/ });
    expect(boardAddressInput).toHaveAttribute("id", "boardAddress");

    const latInput = screen.getByRole("spinbutton", { name: /緯度/ });
    expect(latInput).toHaveAttribute("id", "boardLat");

    const longInput = screen.getByRole("spinbutton", { name: /経度/ });
    expect(longInput).toHaveAttribute("id", "boardLong");
  });
});
