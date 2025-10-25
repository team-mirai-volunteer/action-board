import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MissionsByCategoryClient from "./missions-by-category.client";

jest.mock("./mission-card", () => {
  return function MockMission({
    mission,
    achievementsCount,
    userAchievementCount,
  }: any) {
    return (
      <div data-testid={`mission-${mission.id}`}>
        <div data-testid="mission-title">{mission.title}</div>
        <div data-testid="achievements-count">{achievementsCount}</div>
        <div data-testid="user-achievement-count">{userAchievementCount}</div>
      </div>
    );
  };
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("MissionsByCategoryClient", () => {
  const baseMission = {
    id: "m1",
    title: "ミッション1",
    icon_url: null as string | null,
    difficulty: 1,
    content: "",
    created_at: new Date().toISOString(),
    artifact_label: null as string | null,
    max_achievement_count: null as number | null,
    event_date: null as string | null,
    is_featured: false,
    updated_at: new Date().toISOString(),
    is_hidden: false,
    ogp_image_url: null as string | null,
    required_artifact_type: "NONE" as string,
    featured_importance: null as number | null,
  };

  it("チェックONで未達成のみ表示される", async () => {
    const categories = [
      {
        category_id: "cat-1",
        category_title: "カテゴリ",
        missions: [
          {
            ...baseMission,
            id: "m1",
            title: "達成済",
            max_achievement_count: 1,
          },
          {
            ...baseMission,
            id: "m2",
            title: "未達成",
            max_achievement_count: 3,
          },
        ],
      },
    ];

    render(
      <MissionsByCategoryClient
        categories={categories as any}
        achievementCountList={[
          ["m1", 10],
          ["m2", 5],
        ]}
        userAchievementCounts={[["m1", 1]]}
      />,
    );

    // カテゴリタイトル
    expect(await screen.findByText("カテゴリ")).toBeInTheDocument();

    // 初期状態: 2つとも表示
    expect(screen.getByTestId("mission-m1")).toBeInTheDocument();
    expect(screen.getByTestId("mission-m2")).toBeInTheDocument();

    // チェックONで未達成のみ表示
    const unachievedCheckbox = screen.getByLabelText("未達成のみ");
    await userEvent.click(unachievedCheckbox);
    expect(screen.queryByTestId("mission-m1")).toBeNull();
    expect(screen.getByTestId("mission-m2")).toBeInTheDocument();
  });

  it("達成済みのみ表示され、未達成のみと排他", async () => {
    const categories = [
      {
        category_id: "cat-1",
        category_title: "カテゴリ",
        missions: [
          {
            ...baseMission,
            id: "m1",
            title: "達成済",
            max_achievement_count: 1,
          },
          {
            ...baseMission,
            id: "m2",
            title: "未達成",
            max_achievement_count: 3,
          },
        ],
      },
    ];

    render(
      <MissionsByCategoryClient
        categories={categories as any}
        achievementCountList={[
          ["m1", 10],
          ["m2", 5],
        ]}
        userAchievementCounts={[["m1", 1]]}
      />,
    );

    // 初期状態: 2つとも表示
    expect(await screen.findByText("カテゴリ")).toBeInTheDocument();
    expect(screen.getByTestId("mission-m1")).toBeInTheDocument();
    expect(screen.getByTestId("mission-m2")).toBeInTheDocument();

    // 「達成済みのみ」をON
    const achievedCheckbox = screen.getByLabelText("達成済みのみ");
    await userEvent.click(achievedCheckbox);

    // 達成済のみ表示
    expect(screen.getByTestId("mission-m1")).toBeInTheDocument();
    expect(screen.queryByTestId("mission-m2")).toBeNull();

    // 排他: 未達成のみはOFF
    const unachievedCheckbox = screen.getByLabelText("未達成のみ");
    expect(unachievedCheckbox).not.toBeChecked();

    // OFFに戻すと全て表示
    await userEvent.click(achievedCheckbox);
    expect(screen.getByTestId("mission-m1")).toBeInTheDocument();
    expect(screen.getByTestId("mission-m2")).toBeInTheDocument();
  });

  it("グローバル達成数とユーザー達成数がMissionに渡される", async () => {
    const categories = [
      {
        category_id: "cat-1",
        category_title: "カテゴリ",
        missions: [
          { ...baseMission, id: "m1", title: "A", max_achievement_count: 5 },
        ],
      },
    ];

    render(
      <MissionsByCategoryClient
        categories={categories as any}
        achievementCountList={[["m1", 42]]}
        userAchievementCounts={[["m1", 2]]}
      />,
    );

    expect(await screen.findByTestId("achievements-count")).toHaveTextContent(
      "42",
    );
    expect(screen.getByTestId("user-achievement-count")).toHaveTextContent("2");
  });
});
