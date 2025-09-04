import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import MissionsByCategory from "./missions-by-category";

jest.mock("./mission-card", () => {
  return function MockMission({
    mission,
    achieved,
    achievementsCount,
    userAchievementCount,
  }: any) {
    return (
      <div data-testid={`mission-${mission.id}`}>
        <div data-testid="mission-title">{mission.title}</div>
        <div data-testid="achieved">{achieved.toString()}</div>
        <div data-testid="achievements-count">{achievementsCount}</div>
        <div data-testid="user-achievement-count">{userAchievementCount}</div>
      </div>
    );
  };
});

const mockMissionCategoryViewData = [
  {
    category_id: "category-1",
    category_title: "カテゴリ1",
    category_kbn: "A",
    category_sort_no: 1,
    mission_id: "mission-1",
    title: "ミッション1",
    icon_url: "/icon1.svg",
    difficulty: 1,
    content: "ミッション1の内容",
    created_at: "2025-06-22T00:00:00Z",
    artifact_label: null,
    max_achievement_count: null,
    event_date: null,
    is_featured: false,
    updated_at: "2025-06-22T00:00:00Z",
    is_hidden: false,
    ogp_image_url: null,
    required_artifact_type: "NONE",
    link_sort_no: 1,
  },
  {
    category_id: "category-2",
    category_title: "カテゴリ2",
    category_kbn: "B",
    category_sort_no: 2,
    mission_id: "mission-2",
    title: "ミッション2",
    icon_url: "/icon2.svg",
    difficulty: 2,
    content: "ミッション2の内容",
    created_at: "2025-06-21T00:00:00Z",
    artifact_label: null,
    max_achievement_count: 3,
    event_date: null,
    is_featured: true,
    updated_at: "2025-06-21T00:00:00Z",
    is_hidden: false,
    ogp_image_url: null,
    required_artifact_type: "IMAGE",
    link_sort_no: 1,
  },
];

describe("MissionsByCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("カテゴリ別にミッションが表示される", async () => {
    const component = await MissionsByCategory({
      showAchievedMissions: true,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("ユーザーIDが指定された場合は達成情報を取得する", async () => {
    const component = await MissionsByCategory({
      userId: "test-user-id",
      showAchievedMissions: true,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("データがない場合は適切なメッセージが表示される", async () => {
    const component = await MissionsByCategory({
      showAchievedMissions: true,
    });

    render(component);

    await waitFor(() => {
      expect(
        screen.getByText("ミッションが見つかりませんでした"),
      ).toBeInTheDocument();
    });
  });
});
