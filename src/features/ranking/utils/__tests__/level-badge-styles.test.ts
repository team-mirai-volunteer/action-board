import { getLevelBadgeColor, getLevelBadgeStyle } from "../level-badge-styles";

describe("getLevelBadgeStyle", () => {
  it("returns emerald-600 for level >= 40", () => {
    expect(getLevelBadgeStyle(40)).toBe("bg-emerald-600 text-white");
    expect(getLevelBadgeStyle(50)).toBe("bg-emerald-600 text-white");
  });

  it("returns emerald-500 for level >= 30 and < 40", () => {
    expect(getLevelBadgeStyle(30)).toBe("bg-emerald-500 text-white");
    expect(getLevelBadgeStyle(31)).toBe("bg-emerald-500 text-white");
  });

  it("returns emerald-200 for level >= 20 and < 30", () => {
    expect(getLevelBadgeStyle(20)).toBe("bg-emerald-200 text-emerald-800");
    expect(getLevelBadgeStyle(21)).toBe("bg-emerald-200 text-emerald-800");
  });

  it("returns emerald-100 for level >= 10 and < 20", () => {
    expect(getLevelBadgeStyle(10)).toBe("bg-emerald-100 text-emerald-700");
    expect(getLevelBadgeStyle(11)).toBe("bg-emerald-100 text-emerald-700");
  });

  it("returns emerald-50 for level < 10", () => {
    expect(getLevelBadgeStyle(0)).toBe("bg-emerald-50 text-emerald-600");
    expect(getLevelBadgeStyle(1)).toBe("bg-emerald-50 text-emerald-600");
    expect(getLevelBadgeStyle(9)).toBe("bg-emerald-50 text-emerald-600");
  });

  it("handles boundary values correctly", () => {
    // Just below each threshold
    expect(getLevelBadgeStyle(9)).toBe("bg-emerald-50 text-emerald-600");
    expect(getLevelBadgeStyle(19)).toBe("bg-emerald-100 text-emerald-700");
    expect(getLevelBadgeStyle(29)).toBe("bg-emerald-200 text-emerald-800");
    expect(getLevelBadgeStyle(39)).toBe("bg-emerald-500 text-white");
  });

  it("handles negative levels", () => {
    expect(getLevelBadgeStyle(-1)).toBe("bg-emerald-50 text-emerald-600");
  });
});

describe("getLevelBadgeColor", () => {
  it("returns emerald-100 text-emerald-700 for level >= 40", () => {
    expect(getLevelBadgeColor(40)).toBe("bg-emerald-100 text-emerald-700");
    expect(getLevelBadgeColor(50)).toBe("bg-emerald-100 text-emerald-700");
  });

  it("returns emerald-100 text-emerald-700 for level >= 30", () => {
    expect(getLevelBadgeColor(30)).toBe("bg-emerald-100 text-emerald-700");
  });

  it("returns emerald-100 text-emerald-700 for level >= 20", () => {
    expect(getLevelBadgeColor(20)).toBe("bg-emerald-100 text-emerald-700");
  });

  it("returns emerald-100 text-emerald-700 for level >= 10", () => {
    expect(getLevelBadgeColor(10)).toBe("bg-emerald-100 text-emerald-700");
    expect(getLevelBadgeColor(11)).toBe("bg-emerald-100 text-emerald-700");
  });

  it("returns text-emerald-700 bg-emerald-100 for level < 10", () => {
    expect(getLevelBadgeColor(0)).toBe("text-emerald-700 bg-emerald-100");
    expect(getLevelBadgeColor(1)).toBe("text-emerald-700 bg-emerald-100");
    expect(getLevelBadgeColor(9)).toBe("text-emerald-700 bg-emerald-100");
  });

  it("handles null level by defaulting to 0", () => {
    expect(getLevelBadgeColor(null)).toBe("text-emerald-700 bg-emerald-100");
  });

  it("handles negative levels", () => {
    expect(getLevelBadgeColor(-5)).toBe("text-emerald-700 bg-emerald-100");
  });
});
