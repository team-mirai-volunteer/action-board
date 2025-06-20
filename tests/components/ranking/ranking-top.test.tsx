import React from "react";
import RankingTop from "../../../components/ranking/ranking-top";

jest.mock("../../../lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    rpc: jest.fn(() => Promise.resolve({ data: [] })),
  })),
}));

describe("RankingTop", () => {
  it("ランキングトップの正常レンダリング", async () => {
    const rankingTop = await RankingTop({ limit: 5, showDetailedInfo: true });
    expect(rankingTop.type).toBe("div");
    expect(rankingTop.props.className).toContain("max-w-6xl");
  });

  it("ランキングトップ制限数処理", async () => {
    const rankingTop = await RankingTop({ limit: 10, showDetailedInfo: false });
    expect(rankingTop.type).toBe("div");
  });
});
