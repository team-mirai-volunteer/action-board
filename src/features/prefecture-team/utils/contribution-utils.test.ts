import { calculateContributionPercent } from "./contribution-utils";

describe("calculateContributionPercent", () => {
  it("returns 0 when totalXp is 0", () => {
    expect(calculateContributionPercent(100, 0)).toBe(0);
  });

  it("returns 0 when totalXp is negative", () => {
    expect(calculateContributionPercent(100, -10)).toBe(0);
  });

  it("calculates correct percentage", () => {
    expect(calculateContributionPercent(25, 100)).toBe(25);
  });

  it("returns 100 when user has all XP", () => {
    expect(calculateContributionPercent(500, 500)).toBe(100);
  });
});
