import { getJSTMidnightToday } from "./date-utils";

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
