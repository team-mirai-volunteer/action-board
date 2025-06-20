import {
  calculateXpForLevel,
  xpDelta,
} from "../../../lib/services/xpCalculation";

describe("xpCalculation Service", () => {
  it("レベル用XP計算の正常処理", () => {
    const xp = calculateXpForLevel(2);
    expect(typeof xp).toBe("number");
    expect(xp).toBeGreaterThan(0);
  });

  it("XPデルタ計算の正常処理", () => {
    const delta = xpDelta(50, 2);
    expect(typeof delta).toBe("number");
    expect(delta).toBeGreaterThanOrEqual(0);
  });

  it("レベル1のXP計算", () => {
    const xp = calculateXpForLevel(1);
    expect(xp).toBe(0);
  });

  it("高レベルのXP計算", () => {
    const xp = calculateXpForLevel(10);
    expect(xp).toBeGreaterThan(calculateXpForLevel(5));
  });
});
