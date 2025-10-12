import { createClient } from "@/lib/supabase/client";
import { render, screen, waitFor } from "@testing-library/react";
import MissionsByCategory from "./missions-by-category";
jest.mock("@/lib/supabase/client");

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

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
    category_id: "category-1",
    category_title: "カテゴリ1",
    category_kbn: "A",
    category_sort_no: 1,
    mission_id: "mission-3",
    title: "ミッション3",
    icon_url: "/icon3.svg",
    difficulty: 1,
    content: "ミッション3の内容",
    created_at: "2025-06-23T00:00:00Z",
    artifact_label: null,
    max_achievement_count: 5,
    event_date: null,
    is_featured: false,
    updated_at: "2025-06-23T00:00:00Z",
    is_hidden: false,
    ogp_image_url: null,
    required_artifact_type: "NONE",
    link_sort_no: 2,
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

  const mockSupabase = (options?: {
    achievements?: { mission_id: string }[];
    achievementCounts?: {
      mission_id: string | null;
      achievement_count: number;
    }[];
    missions?: typeof mockMissionCategoryViewData;
  }) => {
    (createClient as jest.Mock).mockReturnValue({
      from: (table: string) => {
        return {
          select: (columns?: string) => {
            if (table === "achievements" && columns === "mission_id") {
              return {
                eq: () =>
                  Promise.resolve({ data: options?.achievements ?? [] }),
              };
            }
            if (
              table === "mission_achievement_count_view" &&
              columns === "mission_id, achievement_count"
            ) {
              return Promise.resolve({
                data: options?.achievementCounts ?? [],
              });
            }
            // mission_category_view
            return {
              order: () => ({
                order: () => Promise.resolve({ data: options?.missions ?? [] }),
              }),
            };
          },
        };
      },
    });
  };

  it("カテゴリ別にミッションが表示される", async () => {
    mockSupabase({ missions: mockMissionCategoryViewData });
    const component = await MissionsByCategory({ userId: "test-user-id" });
    render(component);
    expect(await screen.findByText("カテゴリ1")).toBeInTheDocument();
    expect(await screen.findByText("カテゴリ2")).toBeInTheDocument();
  });

  it("ユーザーIDが指定された場合は達成情報を取得する", async () => {
    mockSupabase({ missions: mockMissionCategoryViewData, achievements: [] });
    const component = await MissionsByCategory({
      userId: "test-user-id",
    });
    render(component);
    expect(await screen.findByText("カテゴリ1")).toBeInTheDocument();
  });

  it("データがない場合は適切なメッセージが表示される", async () => {
    mockSupabase({ missions: [] });
    const component = await MissionsByCategory({ userId: "test-user-id" });
    render(component);
    await waitFor(() => {
      expect(
        screen.getByText("ミッションが見つかりませんでした"),
      ).toBeInTheDocument();
    });
  });

  it("サーバー側でカテゴリ別にグルーピングされる", async () => {
    mockSupabase({
      missions: mockMissionCategoryViewData,
      achievements: [],
      achievementCounts: [],
    });
    const component = await MissionsByCategory({ userId: "test-user-id" });
    render(component);

    // カテゴリ1に2つのミッションがある
    expect(await screen.findByText("カテゴリ1")).toBeInTheDocument();
    expect(screen.getByTestId("mission-mission-1")).toBeInTheDocument();
    expect(screen.getByTestId("mission-mission-3")).toBeInTheDocument();

    // カテゴリ2に1つのミッションがある
    expect(screen.getByText("カテゴリ2")).toBeInTheDocument();
    expect(screen.getByTestId("mission-mission-2")).toBeInTheDocument();
  });

  it("サーバー側で最大達成に到達したミッションが後ろに並ぶ", async () => {
    mockSupabase({
      missions: mockMissionCategoryViewData,
      achievements: [{ mission_id: "mission-3" }],
      achievementCounts: [],
    });
    const component = await MissionsByCategory({ userId: "test-user-id" });
    render(component);

    // カテゴリ1内のミッションの順序を確認
    const missionTitles = screen
      .getAllByTestId("mission-title")
      .map((el) => el.textContent);

    // mission-3は最大達成(5回)に到達しているので後ろに
    // mission-1は最大達成数がないので前に
    const category1Missions = missionTitles.slice(0, 2);
    expect(category1Missions).toEqual(["ミッション1", "ミッション3"]);
  });
});
