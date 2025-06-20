import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

describe("Select", () => {
  it("セレクトコンポーネント存在確認", () => {
    expect(typeof Select).toBe("function");
    expect(typeof SelectContent).toBe("object");
  });

  it("セレクトアイテム存在確認", () => {
    expect(typeof SelectItem).toBe("object");
    expect(typeof SelectTrigger).toBe("object");
    expect(typeof SelectValue).toBe("object");
  });
});
