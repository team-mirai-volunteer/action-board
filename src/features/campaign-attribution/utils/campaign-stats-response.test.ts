import type { CampaignAttributionStat } from "../services/campaign-attribution-stats";
import { buildCampaignStatsResponse } from "./campaign-stats-response";

const NO_FILTERS = {
  campaignCodePrefix: null,
  from: null,
  to: null,
};

function stat(
  campaignCode: string,
  registrations: number,
): CampaignAttributionStat {
  return {
    campaignCode,
    registrations,
    firstRegisteredAt: "2026-07-30T01:00:00.000Z",
    lastRegisteredAt: "2026-07-30T09:00:00.000Z",
  };
}

describe("buildCampaignStatsResponse", () => {
  it("合計登録数とキャンペーン数を集計する", () => {
    const response = buildCampaignStatsResponse(
      [stat("sapporo-0730", 12), stat("aomori-0801", 3)],
      NO_FILTERS,
    );

    expect(response.totalRegistrations).toBe(15);
    expect(response.campaignCount).toBe(2);
    expect(response.campaigns).toHaveLength(2);
    expect(response.truncated).toBe(false);
  });

  it("filtersをそのまま返す", () => {
    const filters = {
      campaignCodePrefix: "sapporo",
      from: "2026-07-30",
      to: "2026-08-05",
    };

    const response = buildCampaignStatsResponse(
      [stat("sapporo-0730", 1)],
      filters,
    );

    expect(response.filters).toEqual(filters);
  });

  it("limitを超えた分は切り詰めるが、合計は全件で計算する", () => {
    const response = buildCampaignStatsResponse(
      [stat("a", 5), stat("b", 3), stat("c", 1)],
      NO_FILTERS,
      2,
    );

    expect(response.campaigns.map((c) => c.campaignCode)).toEqual(["a", "b"]);
    expect(response.totalRegistrations).toBe(9);
    expect(response.campaignCount).toBe(3);
    expect(response.truncated).toBe(true);
    expect(response.notes.join("\n")).toContain("全3件のうち");
  });

  it("0件のときは確認を促すnoteを添える", () => {
    const response = buildCampaignStatsResponse([], NO_FILTERS);

    expect(response.totalRegistrations).toBe(0);
    expect(response.campaignCount).toBe(0);
    expect(response.notes.join("\n")).toContain("登録はまだありません");
  });

  it("数字の読み違いを防ぐ注意書きを必ず含める", () => {
    const response = buildCampaignStatsResponse(
      [stat("sapporo-0730", 12)],
      NO_FILTERS,
    );

    const notes = response.notes.join("\n");
    expect(notes).toContain("新規登録したユーザー数");
    expect(notes).toContain("1ユーザーにつき1コード");
    expect(notes).toContain("党員登録・寄付");
  });
});
