import { render } from "@testing-library/react";
import FeaturedMissions from "./featured-missions";

jest.mock("./mission-list", () => {
  return function MockMissions(props: any) {
    return (
      <div data-testid="missions-component">
        <div data-testid="filter-featured">
          {props.filterFeatured?.toString()}
        </div>
        <div data-testid="title">{props.title}</div>
        <div data-testid="id">{props.id}</div>
        <div data-testid="user-id">{props.userId}</div>
        <div data-testid="max-size">{props.maxSize}</div>
        <div data-testid="show-achieved">
          {props.showAchievedMissions?.toString()}
        </div>
      </div>
    );
  };
});

describe("FeaturedMissions", () => {
  it("Missionsコンポーネントに正しいpropsが渡される", () => {
    const props = {
      userId: "test-user-id",
      maxSize: 5,
      showAchievedMissions: true,
    };

    const { getByTestId } = render(<FeaturedMissions {...props} />);

    expect(getByTestId("filter-featured")).toHaveTextContent("true");
    expect(getByTestId("title")).toHaveTextContent("🌱 はじめのミッション");
    expect(getByTestId("id")).toHaveTextContent("featured-missions");
    expect(getByTestId("user-id")).toHaveTextContent("test-user-id");
    expect(getByTestId("max-size")).toHaveTextContent("5");
    expect(getByTestId("show-achieved")).toHaveTextContent("true");
  });

  it("filterFeaturedが常にtrueに設定される", () => {
    const props = {
      showAchievedMissions: false,
    };

    const { getByTestId } = render(<FeaturedMissions {...props} />);

    expect(getByTestId("filter-featured")).toHaveTextContent("true");
  });

  it("titleとidが固定値で設定される", () => {
    const props = {
      showAchievedMissions: true,
    };

    const { getByTestId } = render(<FeaturedMissions {...props} />);

    expect(getByTestId("title")).toHaveTextContent("🌱 はじめのミッション");
    expect(getByTestId("id")).toHaveTextContent("featured-missions");
  });

  it("オプショナルなpropsが未定義でも正常に動作する", () => {
    const props = {
      showAchievedMissions: false,
    };

    const { getByTestId } = render(<FeaturedMissions {...props} />);

    expect(getByTestId("user-id")).toHaveTextContent("");
    expect(getByTestId("max-size")).toHaveTextContent("");
  });
});
