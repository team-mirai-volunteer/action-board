const { RankingItem } = require("../../../components/ranking/ranking-item");

const mockUser = {
  id: "test-id",
  display_name: "Test User",
  avatar_url: null,
  prefecture: "東京都",
  total_xp: 100,
  level: 2,
  rank: 1,
};

describe("RankingItem", () => {
  it("ユーザー情報でランキング表示", () => {
    const props = { user: mockUser };
    const result = RankingItem(props);
    expect(result).toBeDefined();
  });

  it("詳細情報なしでランキング表示", () => {
    const props = { user: mockUser, showDetailedInfo: false };
    const result = RankingItem(props);
    expect(result).toBeDefined();
  });
});
