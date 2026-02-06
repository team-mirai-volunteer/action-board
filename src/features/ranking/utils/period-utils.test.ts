import { dateFilterToISOString, getPeriodDateFilter } from "./period-utils";

jest.mock("@/lib/utils/date-utils", () => ({
  getJSTMidnightToday: jest
    .fn()
    .mockReturnValue(new Date("2025-01-15T15:00:00.000Z")),
}));

describe("getPeriodDateFilter", () => {
  describe("period='daily' の場合", () => {
    test("getJSTMidnightToday() の結果を返す", () => {
      const result = getPeriodDateFilter("daily");
      expect(result).toEqual(new Date("2025-01-15T15:00:00.000Z"));
    });
  });

  describe("period='all' の場合", () => {
    test("null を返す", () => {
      const result = getPeriodDateFilter("all");
      expect(result).toBeNull();
    });
  });

  describe("未知の period の場合", () => {
    test("null を返す", () => {
      const result = getPeriodDateFilter("unknown" as "all");
      expect(result).toBeNull();
    });
  });
});

describe("dateFilterToISOString", () => {
  describe("Date オブジェクトが渡された場合", () => {
    test("ISO文字列を返す", () => {
      const date = new Date("2025-01-15T15:00:00.000Z");
      const result = dateFilterToISOString(date);
      expect(result).toBe("2025-01-15T15:00:00.000Z");
    });
  });

  describe("null の場合", () => {
    test("undefined を返す", () => {
      const result = dateFilterToISOString(null);
      expect(result).toBeUndefined();
    });
  });
});
