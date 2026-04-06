jest.mock("@/features/user-level/utils/level-calculator", () => ({
  calculateMissionXp: jest.fn().mockReturnValue(100),
  calculateLevel: jest.fn().mockReturnValue(2),
}));

import { achievePosterPlacementMission } from "./achieve-poster-placement-mission";

// Supabase query builder チェーンのモック生成ヘルパー
type MockResult = { data: unknown; error: unknown };

function createChain(result: MockResult) {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.update = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(result);
  chain.maybeSingle = jest.fn().mockResolvedValue(result);
  return chain;
}

function createMockSupabase(overrides: Record<string, MockResult> = {}) {
  const defaults: Record<string, MockResult> = {
    missions: {
      data: {
        id: "mission-1",
        difficulty: 2,
        is_featured: false,
        title: "テストミッション",
      },
      error: null,
    },
    seasons: { data: { id: "season-1" }, error: null },
    achievements: { data: { id: "achievement-1" }, error: null },
    mission_artifacts: { data: { id: "artifact-1" }, error: null },
    xp_transactions: { data: null, error: null },
    user_levels: {
      data: { user_id: "user-1", season_id: "season-1", xp: 50, level: 1 },
      error: null,
    },
  };

  const chains: Record<string, ReturnType<typeof createChain>> = {};
  for (const table of Object.keys(defaults)) {
    chains[table] = createChain(overrides[table] ?? defaults[table]);
  }

  return {
    from: jest.fn(
      (table: string) =>
        chains[table] ?? createChain({ data: null, error: null }),
    ),
    _chains: chains,
  };
}

const baseParams = {
  userId: "user-1",
  prefecture: "東京都",
  city: "渋谷区",
  count: 3,
};

describe("achievePosterPlacementMission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("正常系: 全ステップ成功", async () => {
    const supabase = createMockSupabase();

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result).toEqual({
      success: true,
      artifactId: "artifact-1",
      xpGranted: 100,
    });
  });

  it("ミッション未発見で失敗", async () => {
    const supabase = createMockSupabase({
      missions: { data: null, error: { message: "not found" } },
    });

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result).toEqual({
      success: false,
      error: "ポスター掲示ミッションが見つかりません",
    });
  });

  it("アクティブシーズン未発見で失敗", async () => {
    const supabase = createMockSupabase({
      seasons: { data: null, error: { message: "not found" } },
    });

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result).toEqual({
      success: false,
      error: "アクティブなシーズンが見つかりません",
    });
  });

  it("achievement作成失敗で失敗", async () => {
    const supabase = createMockSupabase({
      achievements: { data: null, error: { message: "insert failed" } },
    });

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result.success).toBe(false);
    expect(result.success === false && result.error).toContain(
      "ミッション達成の記録に失敗しました",
    );
  });

  it("artifact作成失敗で achievement が補償削除される", async () => {
    const supabase = createMockSupabase({
      mission_artifacts: { data: null, error: { message: "insert failed" } },
    });

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result.success).toBe(false);
    // achievements テーブルに delete が呼ばれたことを確認
    expect(supabase._chains.achievements.delete).toHaveBeenCalled();
    expect(supabase._chains.achievements.eq).toHaveBeenCalledWith(
      "id",
      "achievement-1",
    );
  });

  it("XP付与失敗でも成功を返す", async () => {
    const supabase = createMockSupabase({
      xp_transactions: { data: null, error: { message: "xp insert failed" } },
    });

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result).toEqual({
      success: true,
      artifactId: "artifact-1",
      xpGranted: 100,
    });
  });

  it("user_levels未存在の場合は初期化して更新", async () => {
    const supabase = createMockSupabase({
      user_levels: { data: null, error: null },
    });
    // maybeSingle で null → insert → select → single で新規レベル返却
    const userLevelsChain = supabase._chains.user_levels;
    userLevelsChain.maybeSingle.mockResolvedValue({ data: null, error: null });
    userLevelsChain.single.mockResolvedValue({
      data: { user_id: "user-1", season_id: "season-1", xp: 0, level: 1 },
      error: null,
    });

    const result = await achievePosterPlacementMission(
      supabase as any,
      baseParams,
    );

    expect(result.success).toBe(true);
    expect(userLevelsChain.insert).toHaveBeenCalled();
  });

  it("prefecture/city が null の場合、locationText が '住所不明' になる", async () => {
    const supabase = createMockSupabase();

    await achievePosterPlacementMission(supabase as any, {
      ...baseParams,
      prefecture: null,
      city: null,
    });

    // mission_artifacts の insert 呼び出しを検証
    const artifactInsertCall =
      supabase._chains.mission_artifacts.insert.mock.calls[0][0];
    expect(artifactInsertCall.text_content).toContain("住所不明");
    expect(artifactInsertCall.description).toContain("住所不明");
  });
});
