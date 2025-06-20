import React from "react";
import Hero from "../../components/hero";

describe("Hero", () => {
  it("ヒーローセクションの正常レンダリング", () => {
    const hero = Hero();
    expect(hero.type).toBe("div");
    expect(hero.props.className).toContain("relative");
  });

  it("メインメッセージの表示", () => {
    const hero = Hero();
    expect(
      hero.props.children.props.children.props.children[0].props.children[0]
        .props.children,
    ).toContain("チームみらい");
  });
});
