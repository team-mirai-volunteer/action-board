const ButtonModule = require("../../stories/examples/Button");

describe("Button component", () => {
  it("プライマリボタンのクラス名生成", () => {
    const props = { primary: true, label: "Test" };
    const result = ButtonModule.Button(props);
    expect(result.props.className).toContain("storybook-button--primary");
  });

  it("セカンダリボタンのクラス名生成", () => {
    const props = { primary: false, label: "Test" };
    const result = ButtonModule.Button(props);
    expect(result.props.className).toContain("storybook-button--secondary");
  });
});
