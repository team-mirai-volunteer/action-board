import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PeriodToggle } from "./period-toggle";

// Next.js のルーター関連をモック
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("PeriodToggle", () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };
  const mockPathname = "/ranking";
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue(mockPathname);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it("デフォルトで「今日」が選択されている", () => {
    render(<PeriodToggle />);

    const allButton = screen.getByRole("button", { name: "全期間" });
    const dailyButton = screen.getByRole("button", { name: "今日" });

    expect(allButton).toBeInTheDocument();
    expect(dailyButton).toBeInTheDocument();
  });

  it("defaultPeriodプロパティで初期選択を変更できる", () => {
    render(<PeriodToggle defaultPeriod="daily" />);

    const allButton = screen.getByRole("button", { name: "全期間" });

    expect(allButton).toBeInTheDocument();
  });

  it("URLパラメータから現在の期間を読み取る", () => {
    const searchParams = new URLSearchParams("period=daily");
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    render(<PeriodToggle />);

    const dailyButton = screen.getByRole("button", { name: "今日" });
    expect(dailyButton).toBeInTheDocument();
  });

  it("今日ボタンをクリックするとURLパラメータが更新される", async () => {
    const user = userEvent.setup();
    render(<PeriodToggle />);

    const dailyButton = screen.getByRole("button", { name: "今日" });
    await user.click(dailyButton);

    expect(mockPush).toHaveBeenCalledWith("/ranking?period=daily");
  });

  it("全期間ボタンをクリックするとURLパラメータが削除される", async () => {
    const user = userEvent.setup();
    const searchParams = new URLSearchParams("period=daily");
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    render(<PeriodToggle />);

    const allButton = screen.getByRole("button", { name: "全期間" });
    await user.click(allButton);

    expect(mockPush).toHaveBeenCalledWith("/ranking");
  });

  it("既存のURLパラメータを保持しながら期間パラメータを更新する", async () => {
    const user = userEvent.setup();
    const searchParams = new URLSearchParams("sort=desc&page=2");
    (useSearchParams as jest.Mock).mockReturnValue(searchParams);

    render(<PeriodToggle />);

    const dailyButton = screen.getByRole("button", { name: "今日" });
    await user.click(dailyButton);

    expect(mockPush).toHaveBeenCalledWith(
      "/ranking?sort=desc&page=2&period=daily",
    );
  });
});
