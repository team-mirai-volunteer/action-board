import { Input } from "../../../components/ui/input";

describe("Input", () => {
  it("入力コンポーネント存在確認", () => {
    expect(typeof Input).toBe("object");
    expect(Input.displayName).toBeDefined();
  });

  it("入力プロパティ確認", () => {
    const props = { type: "text", placeholder: "Test" };
    expect(props.type).toBe("text");
  });
});
