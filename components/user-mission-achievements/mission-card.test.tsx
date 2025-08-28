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
          missionId="test-mission"
          title="テストミッション"
          count={5}
        />,
      );

      expect(screen.getByText("テストミッション")).toBeInTheDocument();
    });

    it("達成回数が正しく表示される", () => {
      render(
        <MissionAchievementCard
          missionId="test-mission"
          title="テストミッション"
          count={3}
        />,
      );

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("Cardコンポーネントが使用される", () => {
      render(
        <MissionAchievementCard
          missionId="test-mission"
          title="テストミッション"
          count={1}
        />,
      );

      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("様々な値での表示", () => {
    it("達成回数が0の場合も正しく表示される", () => {
      render(
        <MissionAchievementCard
          missionId="test-mission"
          title="未達成ミッション"
          count={0}
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("達成回数が大きい数値の場合も正しく表示される", () => {
      render(
        <MissionAchievementCard
          missionId="test-mission"
          title="人気ミッション"
          count={999}
        />,
      );

      expect(screen.getByText("999")).toBeInTheDocument();
      expect(screen.getByText("回")).toBeInTheDocument();
    });

    it("長いタイトルの場合も表示される", () => {
      const longTitle = "これは非常に長いミッションタイトルのテストです";
      render(
        <MissionAchievementCard
          missionId="test-mission"
          title={longTitle}
          count={2}
        />,
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("達成回数の情報が適切に構造化される", () => {
      render(
        <MissionAchievementCard
          missionId="test-mission"
          title="アクセシビリティテスト"
          count={4}
        />,
      );

      const countNumber = screen.getByText("4");
      const countUnit = screen.getByText("回");

      expect(countNumber).toBeInTheDocument();
      expect(countUnit).toBeInTheDocument();
    });
  });
});
