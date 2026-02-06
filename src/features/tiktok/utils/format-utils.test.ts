import { formatDuration, formatTikTokDate } from "./format-utils";

describe("formatDuration", () => {
  it("null を渡すと空文字を返す", () => {
    expect(formatDuration(null)).toBe("");
  });

  it("0 を渡すと空文字を返す", () => {
    expect(formatDuration(0)).toBe("");
  });

  it("60秒を 1:00 に変換する", () => {
    expect(formatDuration(60)).toBe("1:00");
  });

  it("125秒を 2:05 に変換する", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("3661秒を 61:01 に変換する", () => {
    expect(formatDuration(3661)).toBe("61:01");
  });

  it("30秒を 0:30 に変換する", () => {
    expect(formatDuration(30)).toBe("0:30");
  });

  it("1秒を 0:01 に変換する", () => {
    expect(formatDuration(1)).toBe("0:01");
  });
});

describe("formatTikTokDate", () => {
  it("null を渡すと空文字を返す", () => {
    expect(formatTikTokDate(null)).toBe("");
  });

  it("空文字を渡すと空文字を返す", () => {
    expect(formatTikTokDate("")).toBe("");
  });

  it("有効な日付文字列を ja-JP 形式に変換する", () => {
    const result = formatTikTokDate("2024-01-15T00:00:00Z");
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/15/);
  });

  it("別の日付でも正しくフォーマットされる", () => {
    const result = formatTikTokDate("2023-12-25");
    expect(result).toMatch(/2023/);
    expect(result).toMatch(/12/);
    expect(result).toMatch(/25/);
  });
});
