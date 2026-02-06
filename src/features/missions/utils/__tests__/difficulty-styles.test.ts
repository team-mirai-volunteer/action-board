import {
  difficultyLabels,
  getDifficultyLabel,
  getDifficultyStyles,
} from "../difficulty-styles";

describe("getDifficultyStyles", () => {
  it("returns consistent styles for any difficulty", () => {
    const expected = "text-gray-700 border-gray-400 hover:bg-gray-50";
    expect(getDifficultyStyles(1)).toBe(expected);
    expect(getDifficultyStyles(2)).toBe(expected);
    expect(getDifficultyStyles(3)).toBe(expected);
    expect(getDifficultyStyles(4)).toBe(expected);
    expect(getDifficultyStyles(5)).toBe(expected);
  });

  it("returns the same style for out-of-range values", () => {
    const expected = "text-gray-700 border-gray-400 hover:bg-gray-50";
    expect(getDifficultyStyles(0)).toBe(expected);
    expect(getDifficultyStyles(100)).toBe(expected);
    expect(getDifficultyStyles(-1)).toBe(expected);
  });
});

describe("difficultyLabels", () => {
  it("maps difficulty 1 to single star", () => {
    expect(difficultyLabels[1]).toBe("⭐");
  });

  it("maps difficulty 2 to two stars", () => {
    expect(difficultyLabels[2]).toBe("⭐⭐");
  });

  it("maps difficulty 3 to three stars", () => {
    expect(difficultyLabels[3]).toBe("⭐⭐⭐");
  });

  it("maps difficulty 4 to four stars", () => {
    expect(difficultyLabels[4]).toBe("⭐⭐⭐⭐");
  });

  it("maps difficulty 5 to five stars", () => {
    expect(difficultyLabels[5]).toBe("⭐⭐⭐⭐⭐");
  });

  it("does not have labels for values outside 1-5", () => {
    expect(difficultyLabels[0]).toBeUndefined();
    expect(difficultyLabels[6]).toBeUndefined();
  });
});

describe("getDifficultyLabel", () => {
  it("returns star label for valid difficulties 1-5", () => {
    expect(getDifficultyLabel(1)).toBe("⭐");
    expect(getDifficultyLabel(2)).toBe("⭐⭐");
    expect(getDifficultyLabel(3)).toBe("⭐⭐⭐");
    expect(getDifficultyLabel(4)).toBe("⭐⭐⭐⭐");
    expect(getDifficultyLabel(5)).toBe("⭐⭐⭐⭐⭐");
  });

  it("returns the number itself for unknown difficulties", () => {
    expect(getDifficultyLabel(0)).toBe(0);
    expect(getDifficultyLabel(6)).toBe(6);
    expect(getDifficultyLabel(100)).toBe(100);
    expect(getDifficultyLabel(-1)).toBe(-1);
  });
});
