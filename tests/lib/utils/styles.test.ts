import { cn } from "../../../lib/utils/styles";

describe("cn", () => {
  it("クラス名結合", () => {
    const result = cn("class1", "class2");
    expect(result).toContain("class1");
  });

  it("空クラス名処理", () => {
    const result = cn("", null, undefined, "valid");
    expect(result).toBe("valid");
  });
});
