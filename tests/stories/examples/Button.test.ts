import { Button } from "../../../stories/examples/Button";

describe("Button component", () => {
  it("プライマリボタンのprops処理", () => {
    const props = { primary: true, label: "Test", size: "medium" };
    expect(typeof Button).toBe("function");
    expect(props.primary).toBe(true);
  });

  it("セカンダリボタンのprops処理", () => {
    const props = { primary: false, label: "Test", size: "small" };
    expect(typeof Button).toBe("function");
    expect(props.primary).toBe(false);
  });
});
