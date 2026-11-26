import { fromCacheDate, toPublishedRange } from "./published-range";

describe("toPublishedRange", () => {
  test("未指定は空文字", () => {
    expect(toPublishedRange()).toEqual({
      publishedFrom: "",
      publishedTo: "",
    });
  });

  test("開始日はそのまま ISO 文字列", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    expect(toPublishedRange(start).publishedFrom).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(toPublishedRange(start).publishedTo).toBe("");
  });

  test("終了日はローカル暦の翌日を排他上限にする", () => {
    const end = new Date("2026-03-01T10:00:00.000Z");
    const expected = new Date(end);
    expected.setDate(expected.getDate() + 1);

    expect(toPublishedRange(undefined, end).publishedTo).toBe(
      expected.toISOString(),
    );
    expect(toPublishedRange(undefined, end).publishedFrom).toBe("");
  });
});

describe("fromCacheDate", () => {
  test("空文字は未指定", () => {
    expect(fromCacheDate("")).toBeUndefined();
  });

  test("ISO 文字列はそのまま返す", () => {
    expect(fromCacheDate("2026-01-01T00:00:00.000Z")).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });
});
