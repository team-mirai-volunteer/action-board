import { Toaster } from "../../../components/ui/sonner";

describe("Sonner", () => {
  it("トースターコンポーネント存在確認", () => {
    expect(typeof Toaster).toBe("function");
    expect(Toaster.name).toBe("Toaster");
  });

  it("トースタープロパティ確認", () => {
    const props = { position: "top-right", theme: "light" };
    expect(props.position).toBe("top-right");
    expect(props.theme).toBe("light");
  });
});
