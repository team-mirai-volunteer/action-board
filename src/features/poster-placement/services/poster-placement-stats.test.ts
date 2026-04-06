jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  getCityStats,
  getCityStatsByPrefecture,
  getTotalStats,
} from "./poster-placement-stats";

const mockCreateAdminClient = createAdminClient as jest.MockedFunction<
  typeof createAdminClient
>;

function mockSupabase(result: { data: unknown; error: unknown }) {
  const chain: any = {
    then: jest.fn((resolve: any) => resolve(result)),
  };
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  const supabase = { from: jest.fn().mockReturnValue(chain) };
  mockCreateAdminClient.mockResolvedValue(supabase as any);
  return supabase;
}

describe("getCityStats", () => {
  it("集計データを返す", async () => {
    const data = [
      {
        prefecture: "東京都",
        city: "渋谷区",
        total_count: 10,
        placement_count: 3,
      },
    ];
    mockSupabase({ data, error: null });

    const result = await getCityStats();
    expect(result).toEqual(data);
  });

  it("エラー時にthrowする", async () => {
    mockSupabase({ data: null, error: { message: "db error" } });

    await expect(getCityStats()).rejects.toEqual({ message: "db error" });
  });
});

describe("getCityStatsByPrefecture", () => {
  it("指定都道府県の集計を返す", async () => {
    const data = [
      {
        prefecture: "東京都",
        city: "新宿区",
        total_count: 5,
        placement_count: 2,
      },
    ];
    const supabase = mockSupabase({ data, error: null });

    const result = await getCityStatsByPrefecture("東京都");
    expect(result).toEqual(data);
    expect(supabase.from).toHaveBeenCalledWith("poster_placement_city_stats");
  });

  it("エラー時にthrowする", async () => {
    mockSupabase({ data: null, error: { message: "db error" } });

    await expect(getCityStatsByPrefecture("東京都")).rejects.toEqual({
      message: "db error",
    });
  });
});

describe("getTotalStats", () => {
  it("全国合計を計算して返す", async () => {
    const data = [
      { total_count: 10, placement_count: 3 },
      { total_count: 20, placement_count: 5 },
    ];
    mockSupabase({ data, error: null });

    const result = await getTotalStats();
    expect(result).toEqual({ totalCount: 30, placementCount: 8 });
  });

  it("データが空の場合はゼロを返す", async () => {
    mockSupabase({ data: [], error: null });

    const result = await getTotalStats();
    expect(result).toEqual({ totalCount: 0, placementCount: 0 });
  });

  it("エラー時にthrowする", async () => {
    mockSupabase({ data: null, error: { message: "db error" } });

    await expect(getTotalStats()).rejects.toEqual({ message: "db error" });
  });
});
