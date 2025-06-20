import {
  getMissionRanking,
  getUserMissionRanking,
} from "../../../lib/services/missionsRanking";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    rpc: jest.fn(() =>
      Promise.resolve({
        data: [
          { user_id: "test", user_name: "Test", rank: 1, level: 5, xp: 1000 },
        ],
        error: null,
      }),
    ),
  })),
}));

describe("getMissionRanking", () => {
  it("ミッションランキング取得", async () => {
    const result = await getMissionRanking("mission123", 10);
    expect(result).toHaveLength(1);
  });

  it("制限なしでランキング取得", async () => {
    const result = await getMissionRanking("mission123");
    expect(result[0].user_id).toBe("test");
  });
});
