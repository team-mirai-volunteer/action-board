import { render } from "@testing-library/react";
import { getMissionsWithFilter } from "@/features/missions/loaders/missions-loaders";
import { getUserMissionAchievements } from "@/features/user-achievements/loaders/achievements-loaders";
import FirstMissions, { FIRST_MISSION_SLUGS } from "./first-missions";

jest.mock("@/features/missions/loaders/missions-loaders", () => ({
  getMissionsWithFilter: jest.fn(),
}));

jest.mock("@/features/user-achievements/loaders/achievements-loaders", () => ({
  getUserMissionAchievements: jest.fn(),
}));

jest.mock("./mission-list", () => {
  return function MockMissions(props: any) {
    return (
      <div data-testid="missions-component">
        <div data-testid="filter-slugs">{props.filterSlugs?.join(",")}</div>
        <div data-testid="title">{props.title}</div>
        <div data-testid="id">{props.id}</div>
        <div data-testid="user-id">{props.userId}</div>
        <div data-testid="show-achieved">
          {props.showAchievedMissions?.toString()}
        </div>
      </div>
    );
  };
});

const mockGetMissionsWithFilter = getMissionsWithFilter as jest.Mock;
const mockGetUserMissionAchievements = getUserMissionAchievements as jest.Mock;

const missionOf = (id: string, slug: string) => ({ id, slug });

describe("FirstMissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserMissionAchievements.mockResolvedValue(new Map());
    mockGetMissionsWithFilter.mockResolvedValue([
      missionOf("mission-1", "add-supporter-line-friend"),
    ]);
  });

  it("Missionsコンポーネントに正しいpropsが渡される", async () => {
    const component = await FirstMissions({ userId: "test-user-id" });

    const { getByTestId } = render(component);

    expect(getByTestId("title")).toHaveTextContent("🚩 はじめのミッション");
    expect(getByTestId("id")).toHaveTextContent("first-missions");
    expect(getByTestId("user-id")).toHaveTextContent("test-user-id");
  });

  it("指定した3ミッションが指定の並び順で渡される", async () => {
    const component = await FirstMissions({});

    const { getByTestId } = render(component);

    expect(getByTestId("filter-slugs")).toHaveTextContent(
      "add-supporter-line-friend,join-prefecture-openchat,join-slack",
    );
  });

  it("達成済みのミッションは表示しない（showAchievedMissions=false）", async () => {
    const component = await FirstMissions({ userId: "test-user-id" });

    const { getByTestId } = render(component);

    expect(getByTestId("show-achieved")).toHaveTextContent("false");
  });

  it("未達成のミッションが残っていればセクションを描画する", async () => {
    mockGetUserMissionAchievements.mockResolvedValue(
      new Map([["mission-1", 1]]),
    );
    mockGetMissionsWithFilter.mockResolvedValue([
      missionOf("mission-2", "join-prefecture-openchat"),
    ]);

    const component = await FirstMissions({ userId: "test-user-id" });

    expect(component).not.toBeNull();
    expect(mockGetMissionsWithFilter).toHaveBeenCalledWith({
      filterSlugs: FIRST_MISSION_SLUGS,
      excludeMissionIds: ["mission-1"],
    });
  });

  it("すべて達成済みならセクションごと描画しない", async () => {
    mockGetUserMissionAchievements.mockResolvedValue(
      new Map([
        ["mission-1", 1],
        ["mission-2", 1],
        ["mission-3", 1],
      ]),
    );
    mockGetMissionsWithFilter.mockResolvedValue([]);

    const component = await FirstMissions({ userId: "test-user-id" });

    expect(component).toBeNull();
  });

  it("未ログイン時は達成済み判定なしで全ミッションを表示する", async () => {
    const component = await FirstMissions({});

    expect(component).not.toBeNull();
    expect(mockGetUserMissionAchievements).not.toHaveBeenCalled();
    expect(mockGetMissionsWithFilter).toHaveBeenCalledWith({
      filterSlugs: FIRST_MISSION_SLUGS,
      excludeMissionIds: [],
    });
  });

  it("FIRST_MISSION_SLUGSの並び順が仕様どおりである", () => {
    expect([...FIRST_MISSION_SLUGS]).toEqual([
      "add-supporter-line-friend",
      "join-prefecture-openchat",
      "join-slack",
    ]);
  });
});
