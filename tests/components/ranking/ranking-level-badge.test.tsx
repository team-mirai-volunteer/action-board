const {
  LevelBadge,
} = require("../../../components/ranking/ranking-level-badge");

describe("LevelBadge", () => {
  it("レベルバッジ表示", () => {
    const props = { level: 5 };
    const result = LevelBadge(props);
    expect(result).toBeDefined();
  });

  it("プレフィックスなしレベルバッジ表示", () => {
    const props = { level: 1, showPrefix: false };
    const result = LevelBadge(props);
    expect(result).toBeDefined();
  });
});
