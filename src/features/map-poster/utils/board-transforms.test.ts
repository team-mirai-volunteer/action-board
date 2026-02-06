import {
  buildSummaryFromAggregatedRows,
  buildSummaryFromIndividualRows,
  extractUniqueValues,
} from "./board-transforms";

describe("buildSummaryFromAggregatedRows", () => {
  it("空配列の場合は空オブジェクトを返す", () => {
    const result = buildSummaryFromAggregatedRows([], (row) => row.key);
    expect(result).toEqual({});
  });

  it("単一キーの集計結果を正しく変換する", () => {
    const rows = [
      { prefecture: "東京都", status: "done", count: 10 },
      { prefecture: "東京都", status: "not_yet", count: 5 },
    ];
    const result = buildSummaryFromAggregatedRows(
      rows,
      (row) => row.prefecture,
    );
    expect(result["東京都"].total).toBe(15);
    expect(result["東京都"].statuses.done).toBe(10);
    expect(result["東京都"].statuses.not_yet).toBe(5);
    expect(result["東京都"].statuses.reserved).toBe(0);
  });

  it("複数キーの集計結果を正しく変換する", () => {
    const rows = [
      { prefecture: "東京都", status: "done", count: 10 },
      { prefecture: "大阪府", status: "not_yet", count: 3 },
      { prefecture: "東京都", status: "reserved", count: 2 },
      { prefecture: "大阪府", status: "done", count: 7 },
    ];
    const result = buildSummaryFromAggregatedRows(
      rows,
      (row) => row.prefecture,
    );
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["東京都"].total).toBe(12);
    expect(result["東京都"].statuses.done).toBe(10);
    expect(result["東京都"].statuses.reserved).toBe(2);
    expect(result["大阪府"].total).toBe(10);
    expect(result["大阪府"].statuses.not_yet).toBe(3);
    expect(result["大阪府"].statuses.done).toBe(7);
  });

  it("キーがnullの行はスキップする", () => {
    const rows = [
      { prefecture: "東京都", status: "done", count: 10 },
      { prefecture: null as unknown as string, status: "not_yet", count: 5 },
    ];
    const result = buildSummaryFromAggregatedRows(
      rows,
      (row) => row.prefecture,
    );
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["東京都"].total).toBe(10);
  });

  it("全ステータスがゼロ初期化される", () => {
    const rows = [{ prefecture: "東京都", status: "done", count: 1 }];
    const result = buildSummaryFromAggregatedRows(
      rows,
      (row) => row.prefecture,
    );
    const statuses = result["東京都"].statuses;
    expect(statuses.not_yet).toBe(0);
    expect(statuses.not_yet_dangerous).toBe(0);
    expect(statuses.reserved).toBe(0);
    expect(statuses.error_wrong_place).toBe(0);
    expect(statuses.error_damaged).toBe(0);
    expect(statuses.error_wrong_poster).toBe(0);
    expect(statuses.other).toBe(0);
  });
});

describe("buildSummaryFromIndividualRows", () => {
  it("空配列の場合は空オブジェクトを返す", () => {
    const result = buildSummaryFromIndividualRows([], (row) => row.key);
    expect(result).toEqual({});
  });

  it("個別行から正しくカウントを集計する", () => {
    const rows = [
      { district: "東京1区", status: "done" },
      { district: "東京1区", status: "done" },
      { district: "東京1区", status: "not_yet" },
      { district: "東京2区", status: "reserved" },
    ];
    const result = buildSummaryFromIndividualRows(rows, (row) => row.district);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["東京1区"].total).toBe(3);
    expect(result["東京1区"].statuses.done).toBe(2);
    expect(result["東京1区"].statuses.not_yet).toBe(1);
    expect(result["東京2区"].total).toBe(1);
    expect(result["東京2区"].statuses.reserved).toBe(1);
  });

  it("キーがnullの行はスキップする", () => {
    const rows = [
      { district: "東京1区", status: "done" },
      { district: null as unknown as string, status: "not_yet" },
    ];
    const result = buildSummaryFromIndividualRows(rows, (row) => row.district);
    expect(Object.keys(result)).toHaveLength(1);
    expect(result["東京1区"].total).toBe(1);
  });

  it("全ステータスがゼロ初期化される", () => {
    const rows = [{ district: "東京1区", status: "done" }];
    const result = buildSummaryFromIndividualRows(rows, (row) => row.district);
    const statuses = result["東京1区"].statuses;
    expect(statuses.not_yet).toBe(0);
    expect(statuses.not_yet_dangerous).toBe(0);
    expect(statuses.reserved).toBe(0);
    expect(statuses.error_wrong_place).toBe(0);
    expect(statuses.error_damaged).toBe(0);
    expect(statuses.error_wrong_poster).toBe(0);
    expect(statuses.other).toBe(0);
  });
});

describe("extractUniqueValues", () => {
  it("空配列の場合は空配列を返す", () => {
    const result = extractUniqueValues([], (item) => item);
    expect(result).toEqual([]);
  });

  it("一意な値を抽出する", () => {
    const data = ["東京都", "大阪府", "東京都", "北海道", "大阪府"];
    const result = extractUniqueValues(data, (item) => item);
    expect(result).toHaveLength(3);
    expect(result).toContain("東京都");
    expect(result).toContain("大阪府");
    expect(result).toContain("北海道");
  });

  it("オブジェクト配列から特定フィールドの一意な値を抽出する", () => {
    const data = [
      { prefecture: "東京都" },
      { prefecture: "大阪府" },
      { prefecture: "東京都" },
    ];
    const result = extractUniqueValues(data, (item) => item.prefecture);
    expect(result).toHaveLength(2);
    expect(result).toContain("東京都");
    expect(result).toContain("大阪府");
  });

  it("null値をフィルタリングする", () => {
    const data = [
      { district: "東京1区" },
      { district: null },
      { district: "東京2区" },
      { district: null },
    ];
    const result = extractUniqueValues(data, (item) => item.district);
    expect(result).toHaveLength(2);
    expect(result).toContain("東京1区");
    expect(result).toContain("東京2区");
  });

  it("undefined値をフィルタリングする", () => {
    const data = [{ term: "2025" }, { term: undefined }, { term: "2026" }];
    const result = extractUniqueValues(data, (item) => item.term);
    expect(result).toHaveLength(2);
    expect(result).toContain("2025");
    expect(result).toContain("2026");
  });

  it("全てnull/undefinedの場合は空配列を返す", () => {
    const data = [{ v: null }, { v: undefined }];
    const result = extractUniqueValues(data, (item) => item.v);
    expect(result).toEqual([]);
  });
});
