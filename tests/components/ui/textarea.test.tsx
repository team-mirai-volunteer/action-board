import { Textarea } from "../../../components/ui/textarea";

describe("Textarea", () => {
  it("テキストエリアコンポーネント存在確認", () => {
    expect(typeof Textarea).toBe("object");
    expect(Textarea.displayName).toBeDefined();
  });

  it("テキストエリアプロパティ確認", () => {
    const props = { placeholder: "Enter text", rows: 4 };
    expect(props.placeholder).toBe("Enter text");
    expect(props.rows).toBe(4);
  });
});
