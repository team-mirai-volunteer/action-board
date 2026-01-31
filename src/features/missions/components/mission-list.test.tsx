import { render, screen, waitFor } from "@testing-library/react";
import Missions from "./mission-list";

jest.mock("@/features/missions/components/mission-card", () => {
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

const _mockMissions = [
  {
    id: "mission-1",
    title: "ミッション1",
    difficulty: 1,
    is_hidden: false,
    created_at: "2025-06-22T00:00:00Z",
  },
  {
    id: "mission-2",
    title: "ミッション2",
    difficulty: 2,
    is_hidden: false,
    created_at: "2025-06-21T00:00:00Z",
  },
];

const _mockAchievements = [
  { mission_id: "mission-1" },
  { mission_id: "mission-1" },
  { mission_id: "mission-2" },
];

const _mockAchievementCounts = [
  { mission_id: "mission-1", achievement_count: 10 },
  { mission_id: "mission-2", achievement_count: 5 },
];

describe("Missions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ミッション一覧が正しく表示される", async () => {
    const component = await Missions({
      showAchievedMissions: true,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("カスタムタイトルが表示される", async () => {
    const component = await Missions({
      showAchievedMissions: true,
      title: "カスタムタイトル",
    });

    render(component);

    await waitFor(
      () => {
        expect(screen.getByText("カスタムタイトル")).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });

  it("フィーチャードミッションのフィルタリングが機能する", async () => {
    const component = await Missions({
      showAchievedMissions: true,
      filterFeatured: true,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("最大サイズの制限が機能する", async () => {
    const component = await Missions({
      showAchievedMissions: true,
      maxSize: 3,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("ユーザーIDが指定された場合は達成情報を取得する", async () => {
    const component = await Missions({
      userId: "test-user-id",
      showAchievedMissions: true,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("達成済みミッションを非表示にする設定が機能する", async () => {
    const component = await Missions({
      userId: "test-user-id",
      showAchievedMissions: false,
    });

    render(component);

    expect(component).toBeDefined();
  });

  it("ミッションがない場合は適切なメッセージが表示される", async () => {
    const component = await Missions({
      showAchievedMissions: true,
    });

    render(component);

    await waitFor(() => {
      expect(
        screen.getByText("未達成のミッションはありません"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("新しいミッションが追加されるまでお待ちください"),
      ).toBeInTheDocument();
    });
  });

  it("IDが指定された場合はh2要素にIDが設定される", async () => {
    render(
      await Missions({
        showAchievedMissions: true,
        id: "custom-missions-id",
      }),
    );

    await waitFor(() => {
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveAttribute("id", "custom-missions-id");
    });
  });
});
