import { render, screen } from "@testing-library/react";
import type React from "react";
import { MissionAchievementCard } from "./mission-card";

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

describe("MissionAchievementCard", () => {
  describe("基本的な表示", () => {
    it("ミッションタイトルが正しく表示される", () => {
      render(<MissionAchievementCard title="テストミッション" count={5} />);

      expect(screen.getByText("テストミッション")).toBeInTheDocument();
    });

    it("達成回数が正しく表示される", () => {
      render(<MissionAchievementCard title="テストミッション" count={3} />);

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("Cardコンポーネントが使用される", () => {
      render(<MissionAchievementCard title="テストミッション" count={1} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("様々な値での表示", () => {
    it("達成回数が0の場合も正しく表示される", () => {
      render(<MissionAchievementCard title="未達成ミッション" count={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("達成回数が大きい数値の場合も正しく表示される", () => {
      render(<MissionAchievementCard title="人気ミッション" count={999} />);

      expect(screen.getByText("999")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("長いタイトルの場合も表示される", () => {
      const longTitle = "これは非常に長いミッションタイトルのテストです";
      render(<MissionAchievementCard title={longTitle} count={2} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe("レイアウトとスタイル", () => {
    it("適切なCSSクラスが設定される", () => {
      const { container } = render(
        <MissionAchievementCard title="テストミッション" count={5} />,
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("p-4");

      const flexContainer = container.querySelector(
        ".flex.justify-between.items-center",
      );
      expect(flexContainer).toBeInTheDocument();

      const titleElement = container.querySelector(
        ".text-sm.font-bold.text-gray-700.flex-1.min-w-0.truncate",
      );
      expect(titleElement).toBeInTheDocument();

      const countContainer = container.querySelector(
        ".flex.items-baseline.gap-2.ml-4",
      );
      expect(countContainer).toBeInTheDocument();
    });

    it("達成回数の数字に適切なスタイルが適用される", () => {
      const { container } = render(
        <MissionAchievementCard title="テストミッション" count={7} />,
      );

      const countNumber = container.querySelector(
        ".text-2xl.font-bold.text-teal-600",
      );
      expect(countNumber).toBeInTheDocument();
      expect(countNumber).toHaveTextContent("7");

      const countUnit = container.querySelector(
        ".text-base.font-bold.text-gray-700",
      );
      expect(countUnit).toBeInTheDocument();
      expect(countUnit).toHaveTextContent("回");
    });

    it("タイトルにtruncateクラスが適用される", () => {
      const { container } = render(
        <MissionAchievementCard title="長いタイトル" count={1} />,
      );

      const titleElement = container.querySelector(".truncate");
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveTextContent("長いタイトル");
    });
  });

  describe("アクセシビリティ", () => {
    it("達成回数の情報が適切に構造化される", () => {
      render(
        <MissionAchievementCard title="アクセシビリティテスト" count={4} />,
      );

      const countNumber = screen.getByText("4");
      const countUnit = screen.getByText("回");

      expect(countNumber).toBeInTheDocument();
      expect(countUnit).toBeInTheDocument();
    });
  });
});
