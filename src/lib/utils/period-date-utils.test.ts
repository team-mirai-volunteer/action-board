import { getPeriodEndDate, getPeriodStartDate } from "./period-date-utils";

describe("getPeriodStartDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("日数指定の期間", () => {
    test("period='30' の場合、30日前の日付を返す", () => {
      const result = getPeriodStartDate("30");
      const expected = new Date("2025-06-15T12:00:00Z");
      expected.setDate(expected.getDate() - 30);
      expect(result).toEqual(expected);
    });

    test("period='90' の場合、90日前の日付を返す", () => {
      const result = getPeriodStartDate("90");
      const expected = new Date("2025-06-15T12:00:00Z");
      expected.setDate(expected.getDate() - 90);
      expect(result).toEqual(expected);
    });

    test("period='365' の場合、365日前の日付を返す", () => {
      const result = getPeriodStartDate("365");
      const expected = new Date("2025-06-15T12:00:00Z");
      expected.setDate(expected.getDate() - 365);
      expect(result).toEqual(expected);
    });
  });

  describe("特殊な期間タイプ", () => {
    test("period='this_year' の場合、今年の1月1日を返す", () => {
      const result = getPeriodStartDate("this_year");
      expect(result).toEqual(new Date("2025-01-01"));
    });

    test("period='all_time' の場合、null を返す", () => {
      const result = getPeriodStartDate("all_time");
      expect(result).toBeNull();
    });
  });

  describe("カスタム期間", () => {
    test("period='custom' で customStart 指定時、その日付を返す", () => {
      const result = getPeriodStartDate("custom", "2025-03-01");
      expect(result).toEqual(new Date("2025-03-01"));
    });

    test("period='custom' で customStart 未指定時、今年の1月1日を返す", () => {
      const result = getPeriodStartDate("custom");
      expect(result).toEqual(new Date("2025-01-01"));
    });
  });
});

describe("getPeriodEndDate", () => {
  test("customEnd 指定時、その日付を返す", () => {
    const result = getPeriodEndDate("2025-12-31");
    expect(result).toEqual(new Date("2025-12-31"));
  });

  test("customEnd 未指定時、null を返す", () => {
    const result = getPeriodEndDate();
    expect(result).toBeNull();
  });
});
