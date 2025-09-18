import {
  calculateLevel,
  calculateMissionXp,
  getLevelProgress,
  getXpToNextLevel,
  totalXp,
  xpDelta,
} from "./level-calculator";

describe("xpDelta", () => {
  it("正常系: 各レベルの必要XP差分を正しく返す", () => {
    expect(xpDelta(1)).toBe(40);
    expect(xpDelta(10)).toBe(175);
  });

  it("異常系: レベルが1未満の場合は例外を投げる", () => {
    expect(() => xpDelta(0)).toThrow("Level must be at least 1");
  });
});

describe("totalXp", () => {
  it("正常系: 各レベルに必要な累積XPを返す", () => {
    expect(totalXp(1)).toBe(0);
    expect(totalXp(1000)).toBe(7517475);
  });

  it("異常系: レベルが1未満の場合は例外を投げる", () => {
    expect(() => totalXp(0)).toThrow("Level must be at least 1");
  });
});

// 異常パターンが存在しないため正常系のみ実施
describe("calculateLevel", () => {
  it("正常系: 負の値と境界値のXPを正しく扱う", () => {
    expect(calculateLevel(-5)).toBe(1);
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(39)).toBe(1);
    expect(calculateLevel(40)).toBe(2);
    expect(calculateLevel(7517475)).toBe(1000);
  });
});

// 異常パターンが存在しないため正常系のみ実施
describe("calculateMissionXp", () => {
  it("正常系: 難易度からXPへ正しくマッピングする", () => {
    expect(calculateMissionXp(0)).toBe(50);
    expect(calculateMissionXp(1)).toBe(50);
    expect(calculateMissionXp(2)).toBe(100);
    expect(calculateMissionXp(3)).toBe(200);
    expect(calculateMissionXp(4)).toBe(400);
    expect(calculateMissionXp(5)).toBe(800);
  });
});

// 個別の関数で異常系のテスト済みであるため、正常系のみ実施
describe("getXpToNextLevel", () => {
  it("正常系: 次のレベルまでの残りXPを返す", () => {
    expect(getXpToNextLevel(0)).toBe(40);
    expect(getXpToNextLevel(7517474)).toBe(1); // up to 7517475 for level 1000
  });
});

// 個別の関数で異常系のテスト済みであるため、正常系のみ実施
describe("getLevelProgress", () => {
  it("正常系: レベル開始時は0を返す", () => {
    expect(getLevelProgress(0)).toBe(0);
    expect(getLevelProgress(20)).toBeCloseTo(0.5); // halfway in level 1
    expect(getLevelProgress(40)).toBe(0);
  });
});
