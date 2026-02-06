import {
  formatBirthDate,
  generateDaysArray,
  getDaysInMonth,
} from "./date-form-utils";

describe("formatBirthDate", () => {
  it("引数がnullの場合は空文字列を返す", () => {
    expect(formatBirthDate(null, 1, 5)).toBe("");
    expect(formatBirthDate(2000, null, 5)).toBe("");
    expect(formatBirthDate(2000, 1, null)).toBe("");
  });

  it("月日を0パディングしてYYYY-MM-DD形式を返す", () => {
    expect(formatBirthDate(2000, 1, 5)).toBe("2000-01-05");
  });

  it("2桁の月日はそのまま出力する", () => {
    expect(formatBirthDate(2024, 12, 31)).toBe("2024-12-31");
  });
});

describe("getDaysInMonth", () => {
  it("うるう年の2月は29を返す", () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it("平年の2月は28を返す", () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it("4月は30を返す", () => {
    expect(getDaysInMonth(2024, 4)).toBe(30);
  });

  it("1月は31を返す", () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });
});

describe("generateDaysArray", () => {
  it("うるう年の2月は1から29までの配列を返す", () => {
    const days = generateDaysArray(2024, 2);
    expect(days).toHaveLength(29);
    expect(days[0]).toBe(1);
    expect(days[28]).toBe(29);
  });

  it("平年の2月は1から28までの配列を返す", () => {
    const days = generateDaysArray(2023, 2);
    expect(days).toHaveLength(28);
    expect(days[0]).toBe(1);
    expect(days[27]).toBe(28);
  });
});
