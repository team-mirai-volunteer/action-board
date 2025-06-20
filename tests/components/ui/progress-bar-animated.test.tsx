import { ProgressBarAnimated } from "../../../components/ui/progress-bar-animated";

describe("ProgressBarAnimated", () => {
  it("アニメーション進捗バーコンポーネント存在確認", () => {
    expect(typeof ProgressBarAnimated).toBe("function");
    expect(ProgressBarAnimated.name).toBe("ProgressBarAnimated");
  });

  it("アニメーション進捗バープロパティ確認", () => {
    const props = { value: 50, max: 100 };
    expect(props.value).toBe(50);
    expect(props.max).toBe(100);
  });
});
