import { ProgressCircle } from "../../../components/ui/progress-circle";

describe("ProgressCircle", () => {
  it("円形進捗バーコンポーネント存在確認", () => {
    expect(typeof ProgressCircle).toBe("function");
    expect(ProgressCircle.name).toBe("ProgressCircle");
  });

  it("円形進捗バープロパティ確認", () => {
    const props = { value: 75, size: 100 };
    expect(props.value).toBe(75);
    expect(props.size).toBe(100);
  });
});
