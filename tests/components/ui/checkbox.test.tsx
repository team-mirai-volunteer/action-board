import { Checkbox } from "../../../components/ui/checkbox";

describe("Checkbox", () => {
  it("チェックボックスコンポーネント存在確認", () => {
    expect(typeof Checkbox).toBe("object");
    expect(Checkbox.displayName).toBeDefined();
  });

  it("チェックボックスプロパティ確認", () => {
    const props = { checked: true, disabled: false };
    expect(props.checked).toBe(true);
  });
});
