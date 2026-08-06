import { createAdminClient } from "@/lib/supabase/adminClient";
import { getMissionsWithFilter } from "./missions";

const mockCreateAdminClient = createAdminClient as jest.MockedFunction<
  typeof createAdminClient
>;

type SupabaseAdminClient = Awaited<ReturnType<typeof createAdminClient>>;
type QueryResult = { data: unknown[] | null; error: unknown };

/**
 * supabase-js のクエリビルダを模したチェーン可能なモック。
 * await された時点で result を返し、呼ばれたメソッドと引数を calls に記録する
 */
function createQueryBuilderMock(result: QueryResult) {
  const calls: Record<string, unknown[][]> = {};
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      if (!calls[name]) {
        calls[name] = [];
      }
      calls[name].push(args);
      return builder;
    };

  const builder = {
    select: record("select"),
    eq: record("eq"),
    in: record("in"),
    order: record("order"),
    not: record("not"),
    limit: record("limit"),
    then: (
      onFulfilled?: (value: QueryResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return { builder, calls };
}

function setupAdminClient(result: QueryResult) {
  const { builder, calls } = createQueryBuilderMock(result);
  const from = jest.fn(() => builder);
  mockCreateAdminClient.mockResolvedValue({
    from,
  } as unknown as SupabaseAdminClient);
  return { calls, from };
}

const missionOf = (slug: string) => ({ id: `id-${slug}`, slug });

const FIRST_SLUGS = [
  "add-supporter-line-friend",
  "join-prefecture-openchat",
  "join-slack",
];

describe("getMissionsWithFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("DB操作には createAdminClient を使う", async () => {
    const { from } = setupAdminClient({ data: [], error: null });

    await getMissionsWithFilter();

    expect(mockCreateAdminClient).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("missions");
  });

  it("filterSlugs で絞り込み、DBの並び順に関係なく指定した並び順で返す", async () => {
    // DBからは difficulty / created_at 順（= 指定順とは異なる順）で返ってくる
    const { calls } = setupAdminClient({
      data: [
        missionOf("join-slack"),
        missionOf("add-supporter-line-friend"),
        missionOf("join-prefecture-openchat"),
      ],
      error: null,
    });

    const result = await getMissionsWithFilter({ filterSlugs: FIRST_SLUGS });

    expect(calls.in).toEqual([["slug", FIRST_SLUGS]]);
    expect(result.map((m) => m.slug)).toEqual(FIRST_SLUGS);
  });

  it("filterSlugs と maxSize の併用時は、指定順に並べ替えた後で maxSize を適用する", async () => {
    // DB側で limit(2) されると first が落ちて third が残ってしまう並び順を模す
    const { calls } = setupAdminClient({
      data: [missionOf("third"), missionOf("second"), missionOf("first")],
      error: null,
    });

    const result = await getMissionsWithFilter({
      filterSlugs: ["first", "second", "third"],
      maxSize: 2,
    });

    // 並べ替え前に切り落とさないよう、DB側では limit していない
    expect(calls.limit).toBeUndefined();
    expect(result.map((m) => m.slug)).toEqual(["first", "second"]);
  });

  it("filterSlugs 未指定なら DB 側で limit する", async () => {
    const { calls } = setupAdminClient({
      data: [missionOf("a")],
      error: null,
    });

    await getMissionsWithFilter({ maxSize: 5 });

    expect(calls.limit).toEqual([[5]]);
  });

  it("filterSlugs に含まれない slug が混ざっていても末尾に回す", async () => {
    setupAdminClient({
      data: [missionOf("unknown"), missionOf("second"), missionOf("first")],
      error: null,
    });

    const result = await getMissionsWithFilter({
      filterSlugs: ["first", "second"],
    });

    expect(result.map((m) => m.slug)).toEqual(["first", "second", "unknown"]);
  });

  it("filterSlugs 指定時に該当ミッションが0件なら空配列を返す", async () => {
    setupAdminClient({ data: [], error: null });

    const result = await getMissionsWithFilter({ filterSlugs: FIRST_SLUGS });

    expect(result).toEqual([]);
  });

  it("filterFeatured 指定時は is_featured で絞り込む", async () => {
    const { calls } = setupAdminClient({ data: [], error: null });

    await getMissionsWithFilter({ filterFeatured: true });

    expect(calls.eq).toEqual([
      ["is_hidden", false],
      ["is_featured", true],
    ]);
  });

  it("excludeMissionIds 指定時は該当IDを除外する", async () => {
    const { calls } = setupAdminClient({ data: [], error: null });

    await getMissionsWithFilter({ excludeMissionIds: ["m1", "m2"] });

    expect(calls.not).toEqual([["id", "in", '("m1","m2")']]);
  });

  it("data が null でも空配列を返す", async () => {
    setupAdminClient({ data: null, error: null });

    await expect(getMissionsWithFilter()).resolves.toEqual([]);
  });

  it("取得エラー時は throw する", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("取得失敗");
    setupAdminClient({ data: null, error });

    await expect(getMissionsWithFilter()).rejects.toThrow("取得失敗");

    consoleSpy.mockRestore();
  });
});
