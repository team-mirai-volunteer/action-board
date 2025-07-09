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
});
