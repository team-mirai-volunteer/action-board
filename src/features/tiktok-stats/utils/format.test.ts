import { formatNumberJa, formatNumberJaShort } from "./format";

describe("tiktok-stats/utils/format re-exports", () => {
  it("formatNumberJaがformat-number-jaから正しく再エクスポートされている", () => {
    expect(typeof formatNumberJa).toBe("function");
    expect(formatNumberJa(10000)).toBe("1万");
    expect(formatNumberJa(null)).toBe("-");
  });

  it("formatNumberJaShortがformat-number-jaから正しく再エクスポートされている", () => {
    expect(typeof formatNumberJaShort).toBe("function");
    expect(formatNumberJaShort(10000)).toBe("1万");
    expect(formatNumberJaShort(15000)).toBe("2万");
  });
});
