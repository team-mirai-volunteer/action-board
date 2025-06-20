import { getUserRanking } from "../../../lib/services/userRanking";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
}));

describe("userRanking Service", () => {
  it("ユーザーランキング取得の正常処理", async () => {
    const result = await getUserRanking("user-id");
    expect(result).toBeDefined();
  });

  it("ユーザーランキング空ID処理", async () => {
    const result = await getUserRanking("");
    expect(result).toBeDefined();
  });
});
