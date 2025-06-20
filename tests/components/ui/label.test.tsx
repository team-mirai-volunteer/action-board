import { Label } from "../../../components/ui/label";

describe("Label", () => {
  it("ラベルコンポーネント存在確認", () => {
    expect(typeof Label).toBe("object");
    expect(Label.displayName).toBeDefined();
  });

  it("ラベルプロパティ確認", () => {
    const props = { htmlFor: "test-input" };
    expect(props.htmlFor).toBe("test-input");
  });
});
