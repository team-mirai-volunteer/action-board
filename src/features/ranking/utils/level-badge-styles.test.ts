import { getLevelBadgeColor, getLevelBadgeStyle } from "./level-badge-styles";

describe("getLevelBadgeStyle", () => {
  it.each([
    [0, "bg-emerald-50 text-emerald-600"],
    [5, "bg-emerald-50 text-emerald-600"],
    [9, "bg-emerald-50 text-emerald-600"],
    [10, "bg-emerald-100 text-emerald-700"],
    [15, "bg-emerald-100 text-emerald-700"],
    [19, "bg-emerald-100 text-emerald-700"],
    [20, "bg-emerald-200 text-emerald-800"],
    [25, "bg-emerald-200 text-emerald-800"],
    [29, "bg-emerald-200 text-emerald-800"],
    [30, "bg-emerald-500 text-white"],
    [35, "bg-emerald-500 text-white"],
    [39, "bg-emerald-500 text-white"],
    [40, "bg-emerald-600 text-white"],
    [50, "bg-emerald-600 text-white"],
    [99, "bg-emerald-600 text-white"],
  ])("level %i → %s", (level, expected) => {
    expect(getLevelBadgeStyle(level)).toBe(expected);
  });
});

describe("getLevelBadgeColor", () => {
  it("null → デフォルト色 (level 0 扱い)", () => {
    expect(getLevelBadgeColor(null)).toBe("text-emerald-700 bg-emerald-100");
  });

  it.each([
    [0, "text-emerald-700 bg-emerald-100"],
    [5, "text-emerald-700 bg-emerald-100"],
    [10, "bg-emerald-100 text-emerald-700"],
    [20, "bg-emerald-100 text-emerald-700"],
    [30, "bg-emerald-100 text-emerald-700"],
    [40, "bg-emerald-100 text-emerald-700"],
    [99, "bg-emerald-100 text-emerald-700"],
  ])("level %i → 対応するCSS文字列", (level, expected) => {
    expect(getLevelBadgeColor(level)).toBe(expected);
  });
});
