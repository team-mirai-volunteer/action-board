import { createAdminClient } from "@/lib/supabase/adminClient";
import {
  getCampaignAttributionStats,
  toJstRangeBoundary,
} from "./campaign-attribution-stats";

jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(),
}));

const mockCreateAdminClient = createAdminClient as jest.Mock;

type StatsRow = {
  campaign_code: string;
  registrations: number;
  first_registered_at: string | null;
  last_registered_at: string | null;
};

function setupMockAdminClient({
  rows = [] as StatsRow[],
  error = null as { message: string } | null,
} = {}) {
  const rpc = jest.fn().mockResolvedValue({ data: rows, error });
  mockCreateAdminClient.mockResolvedValue({ rpc });
  return { rpc };
}

describe("toJstRangeBoundary", () => {
  it("startはJSTのその日の0時に変換する", () => {
    expect(toJstRangeBoundary("2026-07-30", "start")).toBe(
      "2026-07-29T15:00:00.000Z",
    );
  });

  it("endExclusiveは翌日JSTの0時（排他境界）に変換する", () => {
    expect(toJstRangeBoundary("2026-07-30", "endExclusive")).toBe(
      "2026-07-30T15:00:00.000Z",
    );
  });

  it("月末・年末をまたぐ排他境界も繰り上がる", () => {
    expect(toJstRangeBoundary("2026-07-31", "endExclusive")).toBe(
      "2026-07-31T15:00:00.000Z",
    );
    expect(toJstRangeBoundary("2026-12-31", "endExclusive")).toBe(
      "2026-12-31T15:00:00.000Z",
    );
  });

  it("YYYY-MM-DD以外の形式はエラーにする", () => {
    expect(() => toJstRangeBoundary("2026/07/30", "start")).toThrow(
      "YYYY-MM-DD",
    );
  });

  it("存在しない日付はエラーにする（Dateの繰り上げで別日にならない）", () => {
    // 2026 は平年
    for (const date of [
      "2026-02-30",
      "2026-02-29",
      "2026-04-31",
      "2026-13-01",
      "2026-00-10",
    ]) {
      expect(() => toJstRangeBoundary(date, "start")).toThrow("存在しない日付");
      expect(() => toJstRangeBoundary(date, "endExclusive")).toThrow(
        "存在しない日付",
      );
    }
  });

  it("うるう日は通す", () => {
    expect(toJstRangeBoundary("2028-02-29", "start")).toBe(
      "2028-02-28T15:00:00.000Z",
    );
  });
});

describe("getCampaignAttributionStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("フィルタ未指定のときは絞り込み条件なし（undefined）でRPCを呼ぶ", async () => {
    const { rpc } = setupMockAdminClient();

    await getCampaignAttributionStats();

    expect(rpc).toHaveBeenCalledWith("get_campaign_attribution_stats", {
      campaign_code_prefix: undefined,
      registered_from: undefined,
      registered_before: undefined,
    });
  });

  it("期間はJSTの日境界に変換してRPCに渡す", async () => {
    const { rpc } = setupMockAdminClient();

    await getCampaignAttributionStats({
      campaignCodePrefix: " sapporo ",
      from: "2026-07-30",
      to: "2026-08-05",
    });

    expect(rpc).toHaveBeenCalledWith("get_campaign_attribution_stats", {
      campaign_code_prefix: "sapporo",
      registered_from: "2026-07-29T15:00:00.000Z",
      // to に指定した 8/5 を含むため、上限は 8/6 0時 JST（排他）
      registered_before: "2026-08-05T15:00:00.000Z",
    });
  });

  it("RPCの結果をcamelCaseに変換して返す", async () => {
    setupMockAdminClient({
      rows: [
        {
          campaign_code: "sapporo-0730",
          registrations: 12,
          first_registered_at: "2026-07-30T01:00:00.000Z",
          last_registered_at: "2026-07-30T09:00:00.000Z",
        },
      ],
    });

    const result = await getCampaignAttributionStats();

    expect(result).toEqual([
      {
        campaignCode: "sapporo-0730",
        registrations: 12,
        firstRegisteredAt: "2026-07-30T01:00:00.000Z",
        lastRegisteredAt: "2026-07-30T09:00:00.000Z",
      },
    ]);
  });

  it("形式不正なキャンペーンコードはDBに問い合わせずエラーにする", async () => {
    const { rpc } = setupMockAdminClient();

    await expect(
      getCampaignAttributionStats({ campaignCodePrefix: "sapporo 0730!" }),
    ).rejects.toThrow("キャンペーンコードは英数字");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("期間が逆順のときはDBに問い合わせずエラーにする", async () => {
    const { rpc } = setupMockAdminClient();

    await expect(
      getCampaignAttributionStats({ from: "2026-08-05", to: "2026-07-30" }),
    ).rejects.toThrow("期間の指定が逆");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("RPCがエラーを返したらエラーを投げる", async () => {
    setupMockAdminClient({ error: { message: "boom" } });

    await expect(getCampaignAttributionStats()).rejects.toThrow(
      "キャンペーン別集計の取得に失敗しました: boom",
    );
  });
});
