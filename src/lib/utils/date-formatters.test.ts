import {
  dateFormatter,
  dateTimeFormatter,
  formatDateLabel,
  formatDateShort,
  formatIsoDuration,
  formatLocalDate,
  formatSecondsDuration,
} from "./date-formatters";

describe("dateTimeFormatter", () => {
  test("UTC日時をJST日時文字列に変換する", () => {
    // UTC 03:30 → JST 12:30
    const date = new Date("2025-01-15T03:30:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/01/15 12:30");
  });

  test("日をまたぐケース: UTC 20:00 → JST 翌日 05:00", () => {
    // 2025-01-15 20:00 UTC → 2025-01-16 05:00 JST
    const date = new Date("2025-01-15T20:00:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/01/16 05:00");
  });

  test("深夜0時ちょうどのケース: UTC 15:00 → JST 00:00", () => {
    // 2025-01-15 15:00 UTC → 2025-01-16 00:00 JST
    const date = new Date("2025-01-15T15:00:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/01/16 00:00");
  });

  test("年末から年始にまたぐケース", () => {
    // 2024-12-31 18:00 UTC → 2025-01-01 03:00 JST
    const date = new Date("2024-12-31T18:00:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/01/01 03:00");
  });

  test("月末から月初にまたぐケース", () => {
    // 2025-01-31 20:00 UTC → 2025-02-01 05:00 JST
    const date = new Date("2025-01-31T20:00:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/02/01 05:00");
  });

  test("UTC午前0時 → JST 09:00", () => {
    const date = new Date("2025-06-15T00:00:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/06/15 09:00");
  });

  test("分が1桁の場合もゼロパディングされる", () => {
    // UTC 00:05 → JST 09:05
    const date = new Date("2025-03-10T00:05:00Z");
    expect(dateTimeFormatter(date)).toBe("2025/03/10 09:05");
  });
});

describe("dateFormatter", () => {
  test("UTC日時をJST日付文字列に変換する", () => {
    const date = new Date("2025-01-15T03:30:00Z");
    expect(dateFormatter(date)).toBe("2025/01/15");
  });

  test("日をまたぐケース: UTC 20:00 → JST 翌日", () => {
    // 2025-01-15 20:00 UTC → 2025-01-16 JST
    const date = new Date("2025-01-15T20:00:00Z");
    expect(dateFormatter(date)).toBe("2025/01/16");
  });

  test("年末から年始にまたぐケース", () => {
    // 2024-12-31 18:00 UTC → 2025-01-01 JST
    const date = new Date("2024-12-31T18:00:00Z");
    expect(dateFormatter(date)).toBe("2025/01/01");
  });

  test("月末から月初にまたぐケース", () => {
    // 2025-01-31 20:00 UTC → 2025-02-01 JST
    const date = new Date("2025-01-31T20:00:00Z");
    expect(dateFormatter(date)).toBe("2025/02/01");
  });

  test("JSTで日をまたがないケース: UTC 14:59 → JST 23:59 同日", () => {
    const date = new Date("2025-01-15T14:59:00Z");
    expect(dateFormatter(date)).toBe("2025/01/15");
  });

  test("月と日が2桁ゼロパディングされる", () => {
    const date = new Date("2025-03-05T00:00:00Z");
    expect(dateFormatter(date)).toBe("2025/03/05");
  });
});

describe("formatLocalDate", () => {
  test("日付をYYYY-MM-DD形式にフォーマットする", () => {
    const date = new Date(2025, 0, 15); // 2025-01-15
    expect(formatLocalDate(date)).toBe("2025-01-15");
  });

  test("月と日が1桁の場合ゼロパディングされる", () => {
    const date = new Date(2025, 2, 5); // 2025-03-05
    expect(formatLocalDate(date)).toBe("2025-03-05");
  });

  test("12月31日を正しくフォーマットする", () => {
    const date = new Date(2025, 11, 31); // 2025-12-31
    expect(formatLocalDate(date)).toBe("2025-12-31");
  });
});

describe("formatDateShort", () => {
  test("日付文字列をja-JPロケールでフォーマットする", () => {
    const result = formatDateShort("2025-01-15");
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/1/);
    expect(result).toMatch(/15/);
  });

  test("nullの場合は空文字を返す", () => {
    expect(formatDateShort(null)).toBe("");
  });

  test("空文字の場合は空文字を返す", () => {
    expect(formatDateShort("")).toBe("");
  });
});

describe("formatDateLabel", () => {
  test("日付をYYYY.MM.DD形式にフォーマットする", () => {
    const date = new Date(2025, 0, 15); // 2025-01-15
    expect(formatDateLabel(date)).toBe("2025.01.15");
  });

  test("月と日が1桁の場合ゼロパディングされる", () => {
    const date = new Date(2025, 2, 5); // 2025-03-05
    expect(formatDateLabel(date)).toBe("2025.03.05");
  });

  test("12月31日を正しくフォーマットする", () => {
    const date = new Date(2025, 11, 31); // 2025-12-31
    expect(formatDateLabel(date)).toBe("2025.12.31");
  });
});

describe("formatIsoDuration", () => {
  test("時間・分・秒をH:MM:SS形式にフォーマットする", () => {
    expect(formatIsoDuration("PT1H2M3S")).toBe("1:02:03");
  });

  test("分・秒のみの場合M:SS形式にフォーマットする", () => {
    expect(formatIsoDuration("PT5M30S")).toBe("5:30");
  });

  test("秒のみの場合0:SS形式にフォーマットする", () => {
    expect(formatIsoDuration("PT45S")).toBe("0:45");
  });

  test("分のみの場合M:00形式にフォーマットする", () => {
    expect(formatIsoDuration("PT10M")).toBe("10:00");
  });

  test("時間のみの場合H:00:00形式にフォーマットする", () => {
    expect(formatIsoDuration("PT2H")).toBe("2:00:00");
  });

  test("nullの場合は空文字を返す", () => {
    expect(formatIsoDuration(null)).toBe("");
  });

  test("不正な形式の場合はそのまま返す", () => {
    expect(formatIsoDuration("invalid")).toBe("invalid");
  });
});

describe("formatSecondsDuration", () => {
  test("秒数をM:SS形式にフォーマットする", () => {
    expect(formatSecondsDuration(90)).toBe("1:30");
  });

  test("60秒未満の場合0:SS形式にフォーマットする", () => {
    expect(formatSecondsDuration(45)).toBe("0:45");
  });

  test("ちょうど1分の場合1:00にフォーマットする", () => {
    expect(formatSecondsDuration(60)).toBe("1:00");
  });

  test("0秒の場合は空文字を返す", () => {
    expect(formatSecondsDuration(0)).toBe("");
  });

  test("nullの場合は空文字を返す", () => {
    expect(formatSecondsDuration(null)).toBe("");
  });

  test("大きな秒数を正しくフォーマットする", () => {
    expect(formatSecondsDuration(605)).toBe("10:05");
  });
});
