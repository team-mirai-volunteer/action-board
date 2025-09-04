import { render, screen } from "@testing-library/react";
import React from "react";
import MissionAchievementStatus from "./mission-achievement-status";

describe("MissionAchievementStatus", () => {
  it("最大達成回数に達していない場合は達成回数が表示される", () => {
    render(
      <MissionAchievementStatus
        hasReachedMaxAchievements={false}
        userAchievementCount={2}
        maxAchievementCount={5}
      />,
    );

    expect(screen.getByText("2/5回達成")).toBeInTheDocument();
  });

  it("最大達成回数に達した場合は完了メッセージが表示される", () => {
    render(
      <MissionAchievementStatus
        hasReachedMaxAchievements={true}
        userAchievementCount={5}
        maxAchievementCount={5}
      />,
    );

    expect(screen.getByText("達成済み")).toBeInTheDocument();
  });

  it("最大達成回数が設定されていない場合は達成回数のみ表示される", () => {
    render(
      <MissionAchievementStatus
        hasReachedMaxAchievements={false}
        userAchievementCount={3}
        maxAchievementCount={null}
      />,
    );

    expect(screen.getByText("3回達成")).toBeInTheDocument();
  });

  it("達成回数が0の場合は適切に表示される", () => {
    render(
      <MissionAchievementStatus
        hasReachedMaxAchievements={false}
        userAchievementCount={0}
        maxAchievementCount={3}
      />,
    );

    expect(screen.getByText("0/3回達成")).toBeInTheDocument();
  });

  it("最大達成回数が0の場合でも正常に動作する", () => {
    render(
      <MissionAchievementStatus
        hasReachedMaxAchievements={true}
        userAchievementCount={0}
        maxAchievementCount={0}
      />,
    );

    expect(screen.getByText("達成済み")).toBeInTheDocument();
  });

  it("達成回数が最大値を超えている場合でも正常に表示される", () => {
    render(
      <MissionAchievementStatus
        hasReachedMaxAchievements={true}
        userAchievementCount={7}
        maxAchievementCount={5}
      />,
    );

    expect(screen.getByText("達成済み")).toBeInTheDocument();
  });
});
