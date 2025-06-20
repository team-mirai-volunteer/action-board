import React from "react";
import Footer from "../../app/footer";

describe("Footer", () => {
  it("フッターコンポーネントの正常レンダリング", () => {
    const footer = Footer();
    expect(footer.type).toBe("footer");
    expect(footer.props.className).toContain("w-full");
  });

  it("フッターリンクの存在確認", () => {
    const footer = Footer();
    expect(
      footer.props.children.props.children.props.children[0].props.children[0]
        .props.href,
    ).toBe("https://team-mir.ai/");
  });
});
