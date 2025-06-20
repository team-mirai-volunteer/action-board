const {
  ProgressBarSimple,
} = require("../../../components/ui/progress-bar-simple");

jest.mock("../../../lib/utils/utils", () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(" ")),
  getXpToNextLevel: jest.fn((xp) => Math.max(0, 100 - (xp % 100))),
  getLevelProgress: jest.fn((xp) => (xp % 100) / 100),
}));

describe("ProgressBarSimple", () => {
  it("正常なXPで進捗バー表示", () => {
    const props = { currentXp: 50 };
    const result = ProgressBarSimple(props);
    expect(result).toBeDefined();
  });

  it("XP0で進捗バー表示", () => {
    const props = { currentXp: 0, showText: false };
    const result = ProgressBarSimple(props);
    expect(result).toBeDefined();
  });
});
