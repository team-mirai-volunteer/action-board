import React from "react";
import RootLayout from "../../app/layout";

jest.mock(
  "../../components/navbar",
  () => () => React.createElement("nav", null, "Navbar"),
);
jest.mock(
  "../../app/footer",
  () => () => React.createElement("footer", null, "Footer"),
);
jest.mock("../../lib/metadata", () => ({
  notoSansJP: { variable: "font-noto-sans-jp" },
  generateRootMetadata: jest.fn(),
}));

describe("RootLayout", () => {
  it("レイアウトコンポーネントの正常レンダリング", () => {
    const layout = RootLayout({
      children: React.createElement("div", null, "Test"),
    });
    expect(layout.type).toBe("html");
    expect(layout.props.lang).toBe("ja");
  });

  it("子要素の正常表示", () => {
    const testChild = React.createElement("div", null, "Child Content");
    const layout = RootLayout({ children: testChild });
    expect(
      layout.props.children.props.children.props.children[1].props.children
        .props.children,
    ).toBe(testChild);
  });
});
