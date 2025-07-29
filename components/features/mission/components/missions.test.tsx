import Missions from "@/components/features/mission/components/Missions";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/components/features/mission/components/Mission", () => {
  return function MockMission({
    mission,
    userAchievementCount,
    totalAchievementCount,
  }: any) {
    return (
      <div data-testid={`mission-${mission.id}`}>
        <div data-testid="mission-title">{mission.title}</div>
        <div data-testid="user-achievement-count">{userAchievementCount}</div>
        <div data-testid="total-achievement-count">{totalAchievementCount}</div>
      </div>
    );
  };
});

const mockMissions = [
  {
    id: "mission-1",
    slug: "mission-1",
    title: "ミッション1",
    content: "内容1",
    difficulty: 1,
    icon_url: null,
    event_date: null,
    max_achievement_count: null,
    is_featured: false,
    is_hidden: false,
    featured_importance: null,
    required_artifact_type: "NONE",
    artifact_label: null,
    ogp_image_url: null,
    created_at: "2025-06-22T00:00:00Z",
    updated_at: "2025-06-22T00:00:00Z",
  },
  {
    id: "mission-2",
    slug: "mission-2",
    title: "ミッション2",
    content: "内容2",
    difficulty: 2,
    icon_url: null,
    event_date: null,
    max_achievement_count: null,
    is_featured: false,
    is_hidden: false,
    featured_importance: null,
    required_artifact_type: "NONE",
    artifact_label: null,
    ogp_image_url: null,
    created_at: "2025-06-21T00:00:00Z",
    updated_at: "2025-06-21T00:00:00Z",
  },
];

const mockAchievements = [
  { mission_id: "mission-1" },
  { mission_id: "mission-1" },
  { mission_id: "mission-2" },
];

const mockAchievementCounts = [
  { mission_id: "mission-1", achievement_count: 10 },
  { mission_id: "mission-2", achievement_count: 5 },
];

describe("Missions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ミッション一覧が正しく表示される", () => {
    render(<Missions missions={mockMissions} />);

    expect(screen.getByText("ミッション1")).toBeInTheDocument();
    expect(screen.getByText("ミッション2")).toBeInTheDocument();
  });

  it("ミッションがない場合は適切なメッセージが表示される", () => {
    render(<Missions missions={[]} />);

    expect(screen.getByText("ミッションがありません")).toBeInTheDocument();
  });

  it("ユーザー達成情報が正しく表示される", () => {
    const userAchievements = { "mission-1": 2, "mission-2": 1 };
    const totalAchievements = { "mission-1": 10, "mission-2": 5 };

    render(
      <Missions
        missions={mockMissions}
        userAchievements={userAchievements}
        totalAchievements={totalAchievements}
      />,
    );

    expect(screen.getByTestId("mission-mission-1")).toBeInTheDocument();
    expect(screen.getByTestId("mission-mission-2")).toBeInTheDocument();
  });
});
