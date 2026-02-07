import {
  formatDateComponents,
  getDaysInMonth,
  verifyMinimumAge,
} from "./form-date-utils";

describe("formatDateComponents", () => {
  it("年月日をYYYY-MM-DD形式にフォーマットする", () => {
    expect(formatDateComponents(2024, 3, 5)).toBe("2024-03-05");
  });

  it("月と日を2桁にパディングする", () => {
    expect(formatDateComponents(2024, 1, 1)).toBe("2024-01-01");
  });

  it("2桁の月日はそのまま出力する", () => {
    expect(formatDateComponents(2024, 12, 31)).toBe("2024-12-31");
  });

  it("yearがnullの場合は空文字列を返す", () => {
    expect(formatDateComponents(null, 3, 5)).toBe("");
  });

  it("monthがnullの場合は空文字列を返す", () => {
    expect(formatDateComponents(2024, null, 5)).toBe("");
  });

  it("dayがnullの場合は空文字列を返す", () => {
    expect(formatDateComponents(2024, 3, null)).toBe("");
  });
});

describe("getDaysInMonth", () => {
  it("1月は31日を返す", () => {
    const days = getDaysInMonth(2024, 1);
    expect(days).toHaveLength(31);
    expect(days[0]).toBe(1);
    expect(days[30]).toBe(31);
  });

  it("うるう年の2月は29日を返す", () => {
    const days = getDaysInMonth(2024, 2);
    expect(days).toHaveLength(29);
  });

  it("平年の2月は28日を返す", () => {
    const days = getDaysInMonth(2023, 2);
    expect(days).toHaveLength(28);
  });

  it("4月は30日を返す", () => {
    const days = getDaysInMonth(2024, 4);
    expect(days).toHaveLength(30);
  });
});

describe("verifyMinimumAge", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-15"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("空文字列の場合はisValid: falseでmessage: nullを返す", () => {
    expect(verifyMinimumAge("", 18)).toEqual({
      isValid: false,
      message: null,
    });
  });

  it("18歳以上の場合はisValid: trueを返す", () => {
    expect(verifyMinimumAge("2008-06-15", 18)).toEqual({
      isValid: true,
      message: null,
    });
  });

  it("17歳の場合はisValid: falseとメッセージを返す（もうすぐ）", () => {
    const result = verifyMinimumAge("2008-06-16", 18);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("もうすぐ");
  });

  it("15歳の場合はあと3年のメッセージを返す", () => {
    const result = verifyMinimumAge("2011-01-01", 18);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("あと3年で");
  });

  it("異なる最低年齢（20歳）で判定できる", () => {
    const result = verifyMinimumAge("2008-06-15", 20);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("20歳以上");
  });
});
