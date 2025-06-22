import Missions from "@/components/mission/missions";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { mockSupabaseClient } from "../../__mocks__/supabase";

jest.mock("@/lib/supabase/server", () => require("../../__mocks__/supabase"));

jest.mock("@/components/mission/mission", () => {
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

const mockMissions = [
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

    mockSupabaseClient.from.mockImplementation((table: string) => {
      let data: any[] = [];
      
      switch (table) {
        case "achievements":
          data = mockAchievements;
          break;
        case "mission_achievement_count_view":
          data = mockAchievementCounts;
          break;
        case "missions":
          data = mockMissions;
          break;
        default:
          data = [];
      }

      const createChainableMock = (resolveData: any[]) => ({
        select: jest.fn().mockImplementation((columns?: string) => {
          if (columns === "mission_id") {
            return {
              eq: jest.fn().mockResolvedValue({ data: resolveData }),
            };
          }
          if (columns === "mission_id, achievement_count") {
            return Promise.resolve({ data: resolveData });
          }
          return createChainableMock(resolveData);
        }),
        eq: jest.fn().mockImplementation(() => createChainableMock(resolveData)),
        not: jest.fn().mockImplementation(() => createChainableMock(resolveData)),
        order: jest.fn().mockImplementation(() => createChainableMock(resolveData)),
        limit: jest.fn().mockResolvedValue({ data: resolveData }),
        then: jest.fn().mockImplementation((onResolve) => {
          const result = { data: resolveData };
          return Promise.resolve(onResolve ? onResolve(result) : result);
        }),
      });

      return createChainableMock(data);
    });
  });

  it("ミッション一覧が正しく表示される", async () => {
    const component = await Missions({
      showAchievedMissions: true,
    });

    render(component);

    await waitFor(
      () => {
        expect(screen.getByText("📈 ミッション")).toBeInTheDocument();
        expect(screen.getByTestId("mission-mission-1")).toBeInTheDocument();
        expect(screen.getByTestId("mission-mission-2")).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
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
    render(
      await Missions({
        showAchievedMissions: true,
        filterFeatured: true,
      }),
    );

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("missions");
    });
  });

  it("最大サイズの制限が機能する", async () => {
    render(
      await Missions({
        showAchievedMissions: true,
        maxSize: 3,
      }),
    );

    await waitFor(() => {
      const missionsQuery = mockSupabaseClient.from.mock.calls.find(
        (call) => call[0] === "missions",
      );
      expect(missionsQuery).toBeDefined();
    });
  });

  it("ユーザーIDが指定された場合は達成情報を取得する", async () => {
    render(
      await Missions({
        userId: "test-user-id",
        showAchievedMissions: true,
      }),
    );

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("achievements");
    });
  });

  it("達成済みミッションを非表示にする設定が機能する", async () => {
    render(
      await Missions({
        userId: "test-user-id",
        showAchievedMissions: false,
      }),
    );

    await waitFor(() => {
      const missionsQuery = mockSupabaseClient.from.mock.calls.find(
        (call) => call[0] === "missions",
      );
      expect(missionsQuery).toBeDefined();
    });
  });

  it("ミッションがない場合は適切なメッセージが表示される", async () => {
    mockSupabaseClient.from.mockImplementation(() => {
      const createChainableMock = (resolveData: any[]) => ({
        select: jest.fn().mockImplementation((columns?: string) => {
          if (columns === "mission_id") {
            return {
              eq: jest.fn().mockResolvedValue({ data: resolveData }),
            };
          }
          if (columns === "mission_id, achievement_count") {
            return Promise.resolve({ data: resolveData });
          }
          return createChainableMock(resolveData);
        }),
        eq: jest.fn().mockImplementation(() => createChainableMock(resolveData)),
        not: jest.fn().mockImplementation(() => createChainableMock(resolveData)),
        order: jest.fn().mockImplementation(() => createChainableMock(resolveData)),
        limit: jest.fn().mockResolvedValue({ data: resolveData }),
        then: jest.fn().mockImplementation((onResolve) => {
          const result = { data: resolveData };
          return Promise.resolve(onResolve ? onResolve(result) : result);
        }),
      });

      return createChainableMock([]);
    });

    render(
      await Missions({
        showAchievedMissions: true,
      }),
    );

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
