import { render, screen } from "@testing-library/react";
import React from "react";
import { UserMissionAchievements } from "./index";

type MissionAchievementSummary = {
  mission_id: string;
  mission_title: string;
  achievement_count: number;
};

jest.mock("./mission-card", () => ({
  MissionAchievementCard: ({
    title,
    count,
  }: { title: string; count: number }) => (
    <div data-testid="mission-card">
      <span data-testid="mission-title">{title}</span>
      <span data-testid="mission-count">{count}</span>
    </div>
  ),
}));

jest.mock("./total-card", () => ({
  MissionAchievementTotalCard: ({ totalCount }: { totalCount: number }) => (
    <div data-testid="total-card">
      <span data-testid="total-count">{totalCount}</span>
    </div>
  ),
}));

const mockAchievements: MissionAchievementSummary[] = [
  {
    mission_id: "mission-1",
    mission_title: "テストミッション1",
    achievement_count: 3,
  },
  {
    mission_id: "mission-2",
    mission_title: "テストミッション2",
    achievement_count: 5,
  },
  {
    mission_id: "mission-3",
    mission_title: "テストミッション3",
    achievement_count: 1,
  },
];

describe("UserMissionAchievements", () => {
  describe("基本的な表示", () => {
    it("タイトルが正しく表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      expect(screen.getByText("ミッション達成状況")).toBeInTheDocument();
    });

    it("総達成数カードが表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      expect(screen.getByTestId("total-card")).toBeInTheDocument();
      expect(screen.getByTestId("total-count")).toHaveTextContent("9");
    });
  });

  describe("ミッション達成カードの表示", () => {
    it("すべてのミッション達成カードが表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      const missionCards = screen.getAllByTestId("mission-card");
      expect(missionCards).toHaveLength(3);
    });

    it("各ミッションの情報が正しく表示される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      expect(screen.getByText("テストミッション1")).toBeInTheDocument();
      expect(screen.getByText("テストミッション2")).toBeInTheDocument();
      expect(screen.getByText("テストミッション3")).toBeInTheDocument();

      const countElements = screen.getAllByTestId("mission-count");
      expect(countElements[0]).toHaveTextContent("3");
      expect(countElements[1]).toHaveTextContent("5");
      expect(countElements[2]).toHaveTextContent("1");
    });

    it("ミッションIDがkeyとして使用される", () => {
      render(
        <UserMissionAchievements
          achievements={mockAchievements}
          totalCount={9}
        />,
      );

      const missionCards = screen.getAllByTestId("mission-card");
      expect(missionCards).toHaveLength(3);
    });
  });

  describe("空の状態", () => {
    it("達成したミッションがない場合でも総達成数カードは表示される", () => {
      render(<UserMissionAchievements achievements={[]} totalCount={0} />);

      expect(screen.getByTestId("total-card")).toBeInTheDocument();
      expect(screen.getByTestId("total-count")).toHaveTextContent("0");
      expect(screen.queryByTestId("mission-card")).not.toBeInTheDocument();
    });

    it("タイトルは常に表示される", () => {
      render(<UserMissionAchievements achievements={[]} totalCount={0} />);

      expect(screen.getByText("ミッション達成状況")).toBeInTheDocument();
    });
  });

  describe("単一のミッション", () => {
    it("1つのミッションのみの場合も正しく表示される", () => {
      const singleAchievement: MissionAchievementSummary[] = [
        {
          mission_id: "single-mission",
          mission_title: "単一ミッション",
          achievement_count: 7,
        },
      ];

      render(
        <UserMissionAchievements
          achievements={singleAchievement}
          totalCount={7}
        />,
      );

      expect(screen.getByTestId("total-card")).toBeInTheDocument();
      expect(screen.getByTestId("total-count")).toHaveTextContent("7");

      const missionCards = screen.getAllByTestId("mission-card");
      expect(missionCards).toHaveLength(1);
      expect(screen.getByText("単一ミッション")).toBeInTheDocument();
    });
  });
});
