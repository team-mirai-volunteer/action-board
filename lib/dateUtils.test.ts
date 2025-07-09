import { getJSTMidnightToday } from "./dateUtils";

describe("getJSTMidnightToday", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return JST midnight when current time is after JST midnight", () => {
    jest.setSystemTime(new Date("2024-01-01T16:00:00.000Z"));

    const result = getJSTMidnightToday();

    expect(result).toEqual(new Date("2024-01-01T15:00:00.000Z"));
  });

  it("should return previous day JST midnight when current time is before JST midnight", () => {
    jest.setSystemTime(new Date("2024-01-01T14:00:00.000Z"));

    const result = getJSTMidnightToday();

    expect(result).toEqual(new Date("2023-12-31T15:00:00.000Z"));
  });

  it("should handle JST midnight boundary correctly", () => {
    jest.setSystemTime(new Date("2024-01-01T15:00:00.000Z"));

    const result = getJSTMidnightToday();

    expect(result).toEqual(new Date("2024-01-01T15:00:00.000Z"));
  });

  describe("JST境界での集計精度テスト", () => {
    it("should handle JST midnight boundary correctly - just before midnight", () => {
      jest.setSystemTime(new Date("2024-01-01T14:59:59.999Z"));

      const result = getJSTMidnightToday();

      expect(result).toEqual(new Date("2023-12-31T15:00:00.000Z"));
    });

    it("should handle JST midnight boundary correctly - exactly at midnight", () => {
      jest.setSystemTime(new Date("2024-01-01T15:00:00.000Z"));

      const result = getJSTMidnightToday();

      expect(result).toEqual(new Date("2024-01-01T15:00:00.000Z"));
    });

    it("should handle JST midnight boundary correctly - just after midnight", () => {
      jest.setSystemTime(new Date("2024-01-01T15:00:01.000Z"));

      const result = getJSTMidnightToday();

      expect(result).toEqual(new Date("2024-01-01T15:00:00.000Z"));
    });

    it("should maintain consistency across multiple calls within same JST day", () => {
      const testTimes = [
        "2024-01-01T15:30:00.000Z", // JST 00:30
        "2024-01-01T18:00:00.000Z", // JST 03:00
        "2024-01-01T21:00:00.000Z", // JST 06:00
        "2024-01-02T12:00:00.000Z", // JST 21:00
        "2024-01-02T14:59:59.999Z", // JST 23:59:59
      ];

      const expectedMidnight = new Date("2024-01-01T15:00:00.000Z");

      for (const timeStr of testTimes) {
        jest.setSystemTime(new Date(timeStr));
        const result = getJSTMidnightToday();
        expect(result).toEqual(expectedMidnight);
      }
    });

    it("should handle year boundary correctly", () => {
      jest.setSystemTime(new Date("2024-01-01T14:59:59.999Z")); // JST 2023-12-31 23:59:59

      const result = getJSTMidnightToday();

      expect(result).toEqual(new Date("2023-12-31T15:00:00.000Z"));
    });

    it("should handle leap year February correctly", () => {
      jest.setSystemTime(new Date("2024-03-01T14:59:59.999Z")); // JST 2024-02-29 23:59:59

      const result = getJSTMidnightToday();

      expect(result).toEqual(new Date("2024-02-29T15:00:00.000Z"));
    });
  });
});
