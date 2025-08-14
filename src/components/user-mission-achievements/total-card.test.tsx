import { render, screen } from "@testing-library/react";
import type React from "react";
import { MissionAchievementTotalCard } from "./total-card";

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

describe("MissionAchievementTotalCard", () => {
  describe("基本的な表示", () => {
    it("総達成数が正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={15} />);

      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("総達成数ラベルが表示される", () => {
      render(<MissionAchievementTotalCard totalCount={10} />);

      expect(screen.getByText("総達成数")).toBeInTheDocument();
    });

    it("トロフィー絵文字が表示される", () => {
      render(<MissionAchievementTotalCard totalCount={5} />);

      expect(screen.getByText("🏆")).toBeInTheDocument();
    });

    it("Cardコンポーネントが使用される", () => {
      render(<MissionAchievementTotalCard totalCount={1} />);

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("様々な値での表示", () => {
    it("総達成数が0の場合も正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("総達成数が大きい数値の場合も正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={1000} />);

      expect(screen.getByText("1000")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("総達成数が1の場合も正しく表示される", () => {
      render(<MissionAchievementTotalCard totalCount={1} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });
  });
});
