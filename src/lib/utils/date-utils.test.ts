import {
  filterBeforeToday,
  getJSTMidnightToday,
  getJstRecentDates,
  getTodayJstString,
  toJstDateString,
} from "./date-utils";

describe("getJSTMidnightToday の動作確認", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("現在日時がUTC・JSTともに「同じ日」の場合、「当日(JST)の00:00」を返す", () => {
    jest.setSystemTime(new Date("2024-06-15T10:00:00.000Z"));
    const result = getJSTMidnightToday();
    expect(result).toEqual(new Date("2024-06-14T15:00:00.000Z"));
  });

  it("現在日時が「JST当日0:00丁度」の場合、「当日(JST)の00:00」を返す", () => {
    jest.setSystemTime(new Date("2024-01-01T15:00:00.000Z"));
    const result = getJSTMidnightToday();
    expect(result).toEqual(new Date("2024-01-01T15:00:00.000Z"));
  });

  it("現在日時が「UTCは前日」だが「JSTは当日」の場合、「当日(JST)の0:00」を返す", () => {
    jest.setSystemTime(new Date("2024-06-14T23:30:00.000Z"));
    const result = getJSTMidnightToday();
    expect(result).toEqual(new Date("2024-06-14T15:00:00.000Z"));
  });
});

describe("toJstDateString", () => {
  it("UTC 0:00 の場合、JSTでは当日(+9時間)の日付文字列を返す", () => {
    // UTC 2024-06-15 00:00 → JST 2024-06-15 09:00
    const result = toJstDateString(new Date("2024-06-15T00:00:00.000Z"));
    expect(result).toBe("2024-06-15");
  });

  it("UTC 15:00 (JST 翌日0:00) の場合、JSTの翌日の日付文字列を返す", () => {
    // UTC 2024-06-15 15:00 → JST 2024-06-16 00:00
    const result = toJstDateString(new Date("2024-06-15T15:00:00.000Z"));
    expect(result).toBe("2024-06-16");
  });

  it("UTC 14:59 の場合、JSTではまだ当日の日付文字列を返す", () => {
    // UTC 2024-06-15 14:59 → JST 2024-06-15 23:59
    const result = toJstDateString(new Date("2024-06-15T14:59:00.000Z"));
    expect(result).toBe("2024-06-15");
  });

  it("YYYY-MM-DD形式で返す", () => {
    const result = toJstDateString(new Date("2024-01-05T00:00:00.000Z"));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("年末のUTC 15:00はJSTで翌年になる", () => {
    // UTC 2024-12-31 15:00 → JST 2025-01-01 00:00
    const result = toJstDateString(new Date("2024-12-31T15:00:00.000Z"));
    expect(result).toBe("2025-01-01");
  });
});

describe("getJstRecentDates", () => {
  it("今日・昨日・一昨日の日付文字列を正しく返す", () => {
    // UTC 2024-06-15 10:00 → JST 2024-06-15 19:00
    const now = new Date("2024-06-15T10:00:00.000Z");
    const result = getJstRecentDates(now);
    expect(result).toEqual({
      today: "2024-06-15",
      yesterday: "2024-06-14",
      dayBeforeYesterday: "2024-06-13",
    });
  });

  it("月をまたぐ場合に正しく計算する", () => {
    // UTC 2024-07-01 00:00 → JST 2024-07-01 09:00
    const now = new Date("2024-07-01T00:00:00.000Z");
    const result = getJstRecentDates(now);
    expect(result).toEqual({
      today: "2024-07-01",
      yesterday: "2024-06-30",
      dayBeforeYesterday: "2024-06-29",
    });
  });

  it("年をまたぐ場合に正しく計算する", () => {
    // UTC 2025-01-01 00:00 → JST 2025-01-01 09:00
    const now = new Date("2025-01-01T00:00:00.000Z");
    const result = getJstRecentDates(now);
    expect(result).toEqual({
      today: "2025-01-01",
      yesterday: "2024-12-31",
      dayBeforeYesterday: "2024-12-30",
    });
  });

  it("JST日付変更線をまたぐ場合に正しく計算する", () => {
    // UTC 2024-06-15 15:00 → JST 2024-06-16 00:00
    const now = new Date("2024-06-15T15:00:00.000Z");
    const result = getJstRecentDates(now);
    expect(result).toEqual({
      today: "2024-06-16",
      yesterday: "2024-06-15",
      dayBeforeYesterday: "2024-06-14",
    });
  });
});

describe("getTodayJstString", () => {
  it("toJstDateStringと同じ結果を返す", () => {
    const now = new Date("2024-06-15T10:00:00.000Z");
    expect(getTodayJstString(now)).toBe(toJstDateString(now));
  });

  it("JST日付変更線をまたぐ場合もtoJstDateStringと一致する", () => {
    const now = new Date("2024-06-15T15:00:00.000Z");
    expect(getTodayJstString(now)).toBe(toJstDateString(now));
  });
});

describe("filterBeforeToday", () => {
  it("今日より前のデータのみ返す", () => {
    // UTC 2024-06-15 10:00 → JST 2024-06-15 19:00 → today = "2024-06-15"
    const now = new Date("2024-06-15T10:00:00.000Z");
    const items = [
      { date: "2024-06-13", value: "a" },
      { date: "2024-06-14", value: "b" },
      { date: "2024-06-15", value: "c" },
      { date: "2024-06-16", value: "d" },
    ];
    const result = filterBeforeToday(items, now);
    expect(result).toEqual([
      { date: "2024-06-13", value: "a" },
      { date: "2024-06-14", value: "b" },
    ]);
  });

  it("今日のデータは除外される", () => {
    const now = new Date("2024-06-15T10:00:00.000Z");
    const items = [{ date: "2024-06-15", value: "today" }];
    const result = filterBeforeToday(items, now);
    expect(result).toEqual([]);
  });

  it("空配列はそのまま返す", () => {
    const now = new Date("2024-06-15T10:00:00.000Z");
    const result = filterBeforeToday([], now);
    expect(result).toEqual([]);
  });

  it("全てのデータが今日より前の場合、全て返す", () => {
    const now = new Date("2024-06-15T10:00:00.000Z");
    const items = [
      { date: "2024-06-13", value: "a" },
      { date: "2024-06-14", value: "b" },
    ];
    const result = filterBeforeToday(items, now);
    expect(result).toEqual(items);
  });

  it("全てのデータが今日以降の場合、空配列を返す", () => {
    const now = new Date("2024-06-15T10:00:00.000Z");
    const items = [
      { date: "2024-06-15", value: "a" },
      { date: "2024-06-16", value: "b" },
    ];
    const result = filterBeforeToday(items, now);
    expect(result).toEqual([]);
  });
});
