import { render } from "@testing-library/react";
import FirstMissions, { FIRST_MISSION_SLUGS } from "./first-missions";

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

describe("FirstMissions", () => {
  it("Missionsコンポーネントに正しいpropsが渡される", () => {
    const props = {
      userId: "test-user-id",
      showAchievedMissions: true,
    };

    const { getByTestId } = render(<FirstMissions {...props} />);

    expect(getByTestId("title")).toHaveTextContent("🚩 はじめのミッション");
    expect(getByTestId("id")).toHaveTextContent("first-missions");
    expect(getByTestId("user-id")).toHaveTextContent("test-user-id");
    expect(getByTestId("show-achieved")).toHaveTextContent("true");
  });

  it("指定した3ミッションが指定の並び順で渡される", () => {
    const { getByTestId } = render(
      <FirstMissions showAchievedMissions={true} />,
    );

    expect(getByTestId("filter-slugs")).toHaveTextContent(
      "add-supporter-line-friend,join-prefecture-openchat,join-slack",
    );
  });

  it("FIRST_MISSION_SLUGSの並び順が仕様どおりである", () => {
    expect([...FIRST_MISSION_SLUGS]).toEqual([
      "add-supporter-line-friend",
      "join-prefecture-openchat",
      "join-slack",
    ]);
  });
});
