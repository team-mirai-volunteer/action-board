import { render } from "@testing-library/react";
import React from "react";
import Hero from "../../components/hero";

jest.mock("../../lib/services/users", () => ({
  getUser: jest.fn(() => Promise.resolve(null)),
}));

jest.mock("../../components/levels", () => {
  return function MockLevels() {
    return React.createElement(
      "div",
      { "data-testid": "levels" },
      "Levels Component",
    );
  };
});

describe("Hero", () => {
  it("ヒーローセクションの正常レンダリング", async () => {
    const HeroComponent = await Hero();
    const { container } = render(HeroComponent);
    expect(container.firstChild).toHaveClass("relative");
  });

  it("メインメッセージの表示", async () => {
    const HeroComponent = await Hero();
    const { getByText } = render(HeroComponent);
    expect(getByText("チームみらい")).toBeInTheDocument();
  });
});
