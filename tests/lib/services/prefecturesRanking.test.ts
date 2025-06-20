import {
  getPrefecturesRanking,
  getUserPrefecturesRanking,
} from "../../../lib/services/prefecturesRanking";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    rpc: jest.fn(() =>
      Promise.resolve({
        data: [{ user_id: "user1", rank: 1, total_xp: 5000 }],
        error: null,
      }),
    ),
  })),
}));

describe("Prefecture Ranking Service", () => {
  it("都道府県ランキング取得", async () => {
    const result = await getPrefecturesRanking("Tokyo");
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe("user1");
  });

  it("ユーザー都道府県ランキング取得", async () => {
    const result = await getUserPrefecturesRanking("user123", "Tokyo");
    expect(result?.user_id).toBe("user1");
  });
});
