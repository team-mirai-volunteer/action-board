const { DifficultyBadge } = require("../../../components/ui/difficulty-badge");

describe("DifficultyBadge", () => {
  it("難易度1でバッジ表示", () => {
    const props = { difficulty: 1 };
    const result = DifficultyBadge(props);
    expect(result).toBeDefined();
  });

  it("難易度0でバッジ表示", () => {
    const props = { difficulty: 0, showLabel: false };
    const result = DifficultyBadge(props);
    expect(result).toBeDefined();
  });
});
