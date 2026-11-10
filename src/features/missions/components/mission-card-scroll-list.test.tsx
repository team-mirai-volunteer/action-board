import { render, screen } from "@testing-library/react";
import type { Tables } from "@/lib/types/supabase";
import { MissionCardScrollList } from "./mission-card-scroll-list";

jest.mock("./horizontal-scroll-container", () => ({
  HorizontalScrollContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="horizontal-scroll-container">{children}</div>
  ),
}));

jest.mock("./mission-card", () => {
  return function MockMission({
    mission,
    achievementsCount,
    userAchievementCount,
  }: {
    mission: Tables<"missions">;
    achievementsCount: number;
    userAchievementCount: number;
  }) {
    return (
      <div data-testid={`mission-${mission.id}`}>
        <div data-testid="achievements-count">{achievementsCount}</div>
        <div data-testid="user-achievement-count">{userAchievementCount}</div>
      </div>
    );
  };
});

const createMission = (id: string, requiredArtifactType = "NONE") =>
  ({
    id,
    slug: id,
    title: id,
    required_artifact_type: requiredArtifactType,
  }) as Tables<"missions">;

describe("MissionCardScrollList", () => {
  it("横スクロール領域の中に、幅300pxのカードとして指定順に並べる", () => {
    render(
      <MissionCardScrollList
        missions={[createMission("mission-1"), createMission("mission-2")]}
        achievementCountMap={new Map()}
        postingCountMap={new Map()}
        userAchievementCountMap={new Map()}
      />,
    );

    const container = screen.getByTestId("horizontal-scroll-container");
    const cards = [
      screen.getByTestId("mission-mission-1"),
      screen.getByTestId("mission-mission-2"),
    ];

    for (const card of cards) {
      expect(container).toContainElement(card);
      expect(card.parentElement).toHaveClass("shrink-0", "w-[300px]");
    }
    expect(
      cards[0].compareDocumentPosition(cards[1]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("達成数はポスティング枚数を優先し、ユーザーの達成回数も渡す", () => {
    render(
      <MissionCardScrollList
        missions={[
          createMission("mission-1"),
          createMission("posting-1", "POSTING"),
        ]}
        achievementCountMap={
          new Map([
            ["mission-1", 10],
            ["posting-1", 3],
          ])
        }
        postingCountMap={new Map([["posting-1", 500]])}
        userAchievementCountMap={new Map([["mission-1", 2]])}
      />,
    );

    const [missionCount, postingCount] =
      screen.getAllByTestId("achievements-count");
    const [missionUserCount, postingUserCount] = screen.getAllByTestId(
      "user-achievement-count",
    );
    expect(missionCount).toHaveTextContent("10");
    expect(postingCount).toHaveTextContent("500");
    expect(missionUserCount).toHaveTextContent("2");
    expect(postingUserCount).toHaveTextContent("0");
  });
});
