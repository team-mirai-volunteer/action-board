import { dateFormatter, dateTimeFormatter } from "./date-formatters";

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
