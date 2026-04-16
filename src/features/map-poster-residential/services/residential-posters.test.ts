jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  createPosterPlacement,
  deletePosterPlacement,
  getPosterPlacementById,
  getPosterPlacementsByUserId,
  getUserPosterPlacementCount,
  updatePosterPlacementArtifactId,
} from "./residential-posters";

const mockCreateAdminClient = createAdminClient as jest.MockedFunction<
  typeof createAdminClient
>;

function createMockChain(result: { data: unknown; error: unknown }) {
  const chain: any = {
    then: jest.fn((resolve: any) => resolve(result)),
  };
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(result);
  return chain;
}

function mockSupabase(result: { data: unknown; error: unknown }) {
  const chain = createMockChain(result);
  const supabase = { from: jest.fn().mockReturnValue(chain) };
  mockCreateAdminClient.mockResolvedValue(supabase as any);
  return { supabase, chain };
}

const mockPlacement = {
  id: "placement-1",
  user_id: "user-1",
  lat: 35.6762,
  lng: 139.6503,
  prefecture: "東京都",
  city: "渋谷区",
  address: "道玄坂",
  postcode: "150-0043",
  count: 2,
  memo: null,
  mission_artifact_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("createPosterPlacement", () => {
  it("レコードを作成して返す", async () => {
    mockSupabase({ data: mockPlacement, error: null });

    const result = await createPosterPlacement({
      user_id: "user-1",
      lat: 35.6762,
      lng: 139.6503,
    });
    expect(result).toEqual(mockPlacement);
  });

  it("エラー時にthrowする", async () => {
    mockSupabase({ data: null, error: { message: "insert error" } });

    await expect(
      createPosterPlacement({ user_id: "user-1", lat: 35, lng: 139 }),
    ).rejects.toEqual({ message: "insert error" });
  });
});

describe("getPosterPlacementsByUserId", () => {
  it("ユーザーのレコード一覧を返す（is_removedも含む）", async () => {
    const data = [mockPlacement];
    const { chain } = mockSupabase({ data, error: null });
    // 2つの.eq()呼び出し(user_id, is_deleted) + order()に対応
    const orderResult = {
      ...chain,
      then: jest.fn((r: any) => r({ data, error: null })),
    };
    const secondEq = {
      ...chain,
      order: jest.fn().mockReturnValue(orderResult),
    };
    const firstEq = { ...chain, eq: jest.fn().mockReturnValue(secondEq) };
    chain.eq.mockReturnValue(firstEq);

    const result = await getPosterPlacementsByUserId("user-1");
    expect(result).toEqual(data);
  });

  it("エラー時にthrowする", async () => {
    const { chain } = mockSupabase({
      data: null,
      error: { message: "select error" },
    });
    const orderResult = {
      ...chain,
      then: jest.fn((r: any) =>
        r({ data: null, error: { message: "select error" } }),
      ),
    };
    const secondEq = {
      ...chain,
      order: jest.fn().mockReturnValue(orderResult),
    };
    const firstEq = { ...chain, eq: jest.fn().mockReturnValue(secondEq) };
    chain.eq.mockReturnValue(firstEq);

    await expect(getPosterPlacementsByUserId("user-1")).rejects.toEqual({
      message: "select error",
    });
  });
});

describe("getPosterPlacementById", () => {
  it("レコードを返す", async () => {
    mockSupabase({ data: mockPlacement, error: null });

    const result = await getPosterPlacementById("placement-1");
    expect(result).toEqual(mockPlacement);
  });

  it("見つからない場合はnullを返す", async () => {
    mockSupabase({
      data: null,
      error: { code: "PGRST116", message: "not found" },
    });

    const result = await getPosterPlacementById("missing");
    expect(result).toBeNull();
  });

  it("その他のエラー時にthrowする", async () => {
    mockSupabase({ data: null, error: { code: "OTHER", message: "db error" } });

    await expect(getPosterPlacementById("x")).rejects.toEqual({
      code: "OTHER",
      message: "db error",
    });
  });
});

describe("deletePosterPlacement", () => {
  it("正常に削除できる", async () => {
    const { chain } = mockSupabase({ data: null, error: null });
    chain.eq.mockReturnValue({
      then: jest.fn((r: any) => r({ data: null, error: null })),
    });

    await expect(deletePosterPlacement("placement-1")).resolves.toBeUndefined();
  });

  it("エラー時にthrowする", async () => {
    const { chain } = mockSupabase({ data: null, error: null });
    chain.eq.mockReturnValue({
      then: jest.fn((r: any) =>
        r({ data: null, error: { message: "delete error" } }),
      ),
    });

    await expect(deletePosterPlacement("x")).rejects.toEqual({
      message: "delete error",
    });
  });
});

describe("updatePosterPlacementArtifactId", () => {
  it("正常に更新できる", async () => {
    const { chain } = mockSupabase({ data: null, error: null });
    chain.eq.mockReturnValue({
      then: jest.fn((r: any) => r({ data: null, error: null })),
    });

    await expect(
      updatePosterPlacementArtifactId("placement-1", "artifact-1"),
    ).resolves.toBeUndefined();
  });

  it("エラー時にthrowする", async () => {
    const { chain } = mockSupabase({ data: null, error: null });
    chain.eq.mockReturnValue({
      then: jest.fn((r: any) =>
        r({ data: null, error: { message: "update error" } }),
      ),
    });

    await expect(updatePosterPlacementArtifactId("x", "y")).rejects.toEqual({
      message: "update error",
    });
  });
});

describe("getUserPosterPlacementCount", () => {
  it("合計枚数を返す", async () => {
    const data = [{ count: 3 }, { count: 5 }, { count: 2 }];
    const { chain } = mockSupabase({ data, error: null });
    // 3つの.eq()呼び出しに対応: user_id, is_deleted, is_removed
    const terminal = {
      then: jest.fn((r: any) => r({ data, error: null })),
    };
    const second = { ...chain, eq: jest.fn().mockReturnValue(terminal) };
    const first = { ...chain, eq: jest.fn().mockReturnValue(second) };
    chain.eq.mockReturnValue(first);

    const result = await getUserPosterPlacementCount("user-1");
    expect(result).toBe(10);
  });

  it("エラー時にthrowする", async () => {
    const { chain } = mockSupabase({ data: null, error: null });
    const terminal = {
      then: jest.fn((r: any) =>
        r({ data: null, error: { message: "count error" } }),
      ),
    };
    const second = { ...chain, eq: jest.fn().mockReturnValue(terminal) };
    const first = { ...chain, eq: jest.fn().mockReturnValue(second) };
    chain.eq.mockReturnValue(first);

    await expect(getUserPosterPlacementCount("user-1")).rejects.toEqual({
      message: "count error",
    });
  });
});
