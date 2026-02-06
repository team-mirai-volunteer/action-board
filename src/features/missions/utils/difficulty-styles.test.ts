import {
  difficultyLabels,
  getDifficultyLabel,
  getDifficultyStyles,
} from "./difficulty-styles";

describe("getDifficultyStyles", () => {
  it.each([
    1, 2, 3, 4, 5, 0, 99,
  ])("difficulty %i に対して固定CSS文字列を返す", (difficulty) => {
    expect(getDifficultyStyles(difficulty)).toBe(
      "text-gray-700 border-gray-400 hover:bg-gray-50",
    );
  });
});

describe("getDifficultyLabel", () => {
  it.each([
    [1, "⭐"],
    [2, "⭐⭐"],
    [3, "⭐⭐⭐"],
    [4, "⭐⭐⭐⭐"],
    [5, "⭐⭐⭐⭐⭐"],
  ])("difficulty %i → %s を返す", (difficulty, expected) => {
    expect(getDifficultyLabel(difficulty)).toBe(expected);
  });

  it.each([
    0, 6, 99,
  ])("範囲外の difficulty %i → 数値フォールバック", (difficulty) => {
    expect(getDifficultyLabel(difficulty)).toBe(difficulty);
  });
});

describe("difficultyLabels", () => {
  it("1-5のキーが全て存在する", () => {
    for (let i = 1; i <= 5; i++) {
      expect(difficultyLabels[i]).toBeDefined();
    }
  });

  it.each([
    [1, "⭐"],
    [2, "⭐⭐"],
    [3, "⭐⭐⭐"],
    [4, "⭐⭐⭐⭐"],
    [5, "⭐⭐⭐⭐⭐"],
  ])("キー %i が %s に対応する", (key, expected) => {
    expect(difficultyLabels[key]).toBe(expected);
  });
});
