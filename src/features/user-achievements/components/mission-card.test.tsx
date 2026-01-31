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
      render(
        <MissionAchievementCard
          title="テストミッション"
          count={5}
          missionSlug="test-mission-1"
        />,
      );

      expect(screen.getByText("テストミッション")).toBeInTheDocument();
    });

    it("達成回数が正しく表示される", () => {
      render(
        <MissionAchievementCard
          title="テストミッション"
          count={3}
          missionSlug="test-mission-2"
        />,
      );

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("Cardコンポーネントが使用される", () => {
      render(
        <MissionAchievementCard
          title="テストミッション"
          count={1}
          missionSlug="test-mission-3"
        />,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("様々な値での表示", () => {
    it("達成回数が0の場合も正しく表示される", () => {
      render(
        <MissionAchievementCard
          title="未達成ミッション"
          count={0}
          missionSlug="test-mission-4"
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("達成回数が大きい数値の場合も正しく表示される", () => {
      render(
        <MissionAchievementCard
          title="人気ミッション"
          count={999}
          missionSlug="test-mission-5"
        />,
      );

      expect(screen.getByText("999")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("長いタイトルの場合も表示される", () => {
      const longTitle = "これは非常に長いミッションタイトルのテストです";
      render(
        <MissionAchievementCard
          title={longTitle}
          count={2}
          missionSlug="test-mission-6"
        />,
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("達成回数の情報が適切に構造化される", () => {
      render(
        <MissionAchievementCard
          title="アクセシビリティテスト"
          count={4}
          missionSlug="test-mission-7"
        />,
      );

      const countNumber = screen.getByText("4");
      const countUnit = screen.getByText("回");

      expect(countNumber).toBeInTheDocument();
      expect(countUnit).toBeInTheDocument();
    });
  });
});
