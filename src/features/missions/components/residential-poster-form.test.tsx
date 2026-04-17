import { fireEvent, render, screen } from "@testing-library/react";
import { ResidentialPosterMissionForm } from "./residential-poster-form";

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
                const newValue = "個人宅";
                setInternalValue(newValue);
                onValueChange(newValue);
              }
            }}
          >
            Select Type
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

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: any) => (
    <hr data-testid="separator" className={className} />
  ),
}));

describe("ResidentialPosterMissionForm", () => {
  it("必須フィールドがすべて表示される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    expect(screen.getByTestId("select")).toBeInTheDocument();
    expect(screen.getByLabelText(/貼った日付/)).toBeInTheDocument();
    expect(screen.getByLabelText(/掲示枚数/)).toBeInTheDocument();
    expect(screen.getByLabelText(/掲示場所の郵便番号/)).toBeInTheDocument();

    // 必須マーク（*）の確認
    expect(screen.getAllByText("*")).toHaveLength(4);
  });

  it("説明テキストが表示される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    expect(
      screen.getByText("原則ポスター掲示マップ上での報告をお願いします。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "ポスター掲示マップで報告できない場合は以下のフォームに入力してください。",
      ),
    ).toBeInTheDocument();
  });

  it("私有地ポスターマップを開くボタンが表示される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    const mapButton = screen.getByRole("button", {
      name: /私有地ポスターマップを開く/,
    });
    expect(mapButton).toBeInTheDocument();
    expect(mapButton).not.toBeDisabled();
  });

  it("マップボタンをクリックすると新規タブで私有地ポスターマップが開く", () => {
    const windowOpenSpy = jest
      .spyOn(window, "open")
      .mockImplementation(() => null);

    render(<ResidentialPosterMissionForm disabled={false} />);

    const mapButton = screen.getByRole("button", {
      name: /私有地ポスターマップを開く/,
    });
    fireEvent.click(mapButton);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      "/map/poster-residential",
      "_blank",
      "noopener,noreferrer",
    );

    windowOpenSpy.mockRestore();
  });

  it("disabled=trueの場合はすべての入力フィールドが無効化される", () => {
    render(<ResidentialPosterMissionForm disabled={true} />);

    expect(screen.getByTestId("select")).toHaveAttribute(
      "data-disabled",
      "true",
    );
    expect(screen.getByLabelText(/貼った日付/)).toBeDisabled();
    expect(screen.getByLabelText(/掲示枚数/)).toBeDisabled();
    expect(screen.getByLabelText(/掲示場所の郵便番号/)).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /私有地ポスターマップを開く/ }),
    ).toBeDisabled();
  });

  it("disabled=falseの場合はすべての入力フィールドが有効化される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    expect(screen.getByTestId("select")).toHaveAttribute(
      "data-disabled",
      "false",
    );
    expect(screen.getByLabelText(/貼った日付/)).not.toBeDisabled();
    expect(screen.getByLabelText(/掲示枚数/)).not.toBeDisabled();
    expect(screen.getByLabelText(/掲示場所の郵便番号/)).not.toBeDisabled();
  });

  it("各入力フィールドの属性が正しい", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    // 日付フィールド
    const dateInput = screen.getByLabelText(/貼った日付/);
    expect(dateInput).toHaveAttribute("type", "date");
    expect(dateInput).toHaveAttribute("name", "placedDate");
    expect(dateInput).toBeRequired();

    // 枚数フィールド
    const countInput = screen.getByLabelText(/掲示枚数/);
    expect(countInput).toHaveAttribute("type", "number");
    expect(countInput).toHaveAttribute("name", "residentialPosterCount");
    expect(countInput).toHaveAttribute("min", "1");
    expect(countInput).toBeRequired();

    // 郵便番号フィールド
    const postalInput = screen.getByLabelText(/掲示場所の郵便番号/);
    expect(postalInput).toHaveAttribute("type", "text");
    expect(postalInput).toHaveAttribute("name", "locationText");
    expect(postalInput).toHaveAttribute("maxLength", "7");
  });

  it("hidden inputにlocationType名が設定される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    const hiddenInput = document.querySelector(
      'input[name="locationType"][type="hidden"]',
    );
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute("value", "");
  });

  it("ヘルプテキストが表示される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    expect(
      screen.getByText("掲示した枚数を入力してください"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("対象エリアの郵便番号をご入力ください"),
    ).toBeInTheDocument();
  });

  it("プレースホルダーが表示される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    expect(screen.getByPlaceholderText("例：1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("例：1540017")).toBeInTheDocument();
  });

  it("郵便番号が不正な場合にblur後エラーが表示される", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    const postalInput = screen.getByLabelText(/掲示場所の郵便番号/);

    // 不正な値を入力してblur
    fireEvent.change(postalInput, { target: { value: "123" } });
    fireEvent.blur(postalInput);

    expect(
      screen.getByText("郵便番号はハイフンなし7桁で入力をお願いします"),
    ).toBeInTheDocument();
  });

  it("郵便番号が正しい場合はエラーが表示されない", () => {
    render(<ResidentialPosterMissionForm disabled={false} />);

    const postalInput = screen.getByLabelText(/掲示場所の郵便番号/);

    fireEvent.change(postalInput, { target: { value: "1540017" } });
    fireEvent.blur(postalInput);

    expect(
      screen.queryByText("郵便番号はハイフンなし7桁で入力をお願いします"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("対象エリアの郵便番号をご入力ください"),
    ).toBeInTheDocument();
  });

  it("未入力時はonValidityChangeにfalseが渡される", () => {
    const onValidityChange = jest.fn();

    render(
      <ResidentialPosterMissionForm
        disabled={false}
        onValidityChange={onValidityChange}
      />,
    );

    expect(onValidityChange).toHaveBeenCalledWith(false);
  });

  it("全フィールド入力後にonValidityChangeにtrueが渡される", () => {
    const onValidityChange = jest.fn();

    render(
      <ResidentialPosterMissionForm
        disabled={false}
        onValidityChange={onValidityChange}
      />,
    );

    // 種別を選択
    fireEvent.click(screen.getByText("Select Type"));

    // 日付を入力
    fireEvent.change(screen.getByLabelText(/貼った日付/), {
      target: { value: "2026-04-16" },
    });

    // 枚数を入力
    fireEvent.change(screen.getByLabelText(/掲示枚数/), {
      target: { value: "3" },
    });

    // 郵便番号を入力
    fireEvent.change(screen.getByLabelText(/掲示場所の郵便番号/), {
      target: { value: "1540017" },
    });

    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });

  it("枚数が0の場合はonValidityChangeにfalseが渡される", () => {
    const onValidityChange = jest.fn();

    render(
      <ResidentialPosterMissionForm
        disabled={false}
        onValidityChange={onValidityChange}
      />,
    );

    // 種別を選択
    fireEvent.click(screen.getByText("Select Type"));

    // 日付を入力
    fireEvent.change(screen.getByLabelText(/貼った日付/), {
      target: { value: "2026-04-16" },
    });

    // 枚数を0に設定
    fireEvent.change(screen.getByLabelText(/掲示枚数/), {
      target: { value: "0" },
    });

    // 郵便番号を入力
    fireEvent.change(screen.getByLabelText(/掲示場所の郵便番号/), {
      target: { value: "1540017" },
    });

    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });

  it("郵便番号が不正な桁数の場合はonValidityChangeにfalseが渡される", () => {
    const onValidityChange = jest.fn();

    render(
      <ResidentialPosterMissionForm
        disabled={false}
        onValidityChange={onValidityChange}
      />,
    );

    // 種別を選択
    fireEvent.click(screen.getByText("Select Type"));

    // 日付を入力
    fireEvent.change(screen.getByLabelText(/貼った日付/), {
      target: { value: "2026-04-16" },
    });

    // 枚数を入力
    fireEvent.change(screen.getByLabelText(/掲示枚数/), {
      target: { value: "3" },
    });

    // 郵便番号を不正な桁数で入力
    fireEvent.change(screen.getByLabelText(/掲示場所の郵便番号/), {
      target: { value: "123" },
    });

    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });
});
