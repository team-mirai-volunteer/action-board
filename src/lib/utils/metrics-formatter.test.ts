import {
  formatAmount,
  formatNumber,
  formatUpdateTime,
} from "./metrics-formatter";

describe("formatAmount", () => {
  describe("万円単位の場合", () => {
    it("整数の万円をフォーマットする", () => {
      expect(formatAmount(1234)).toBe("1234万円");
    });

    it("小数点以下0は省略する", () => {
      expect(formatAmount(1234.0)).toBe("1234万円");
    });

    it("小数点以下がある場合は表示する", () => {
      expect(formatAmount(1234.5)).toBe("1234.5万円");
    });

    it("1万円未満をフォーマットする", () => {
      expect(formatAmount(1)).toBe("1万円");
    });
  });

  describe("億円単位の場合", () => {
    it("ちょうど億円の場合", () => {
      expect(formatAmount(10000)).toBe("1億円");
      expect(formatAmount(20000)).toBe("2億円");
    });

    it("億と万が混在する場合", () => {
      expect(formatAmount(12345)).toBe("1億2345万円");
    });

    it("億と万（小数あり）が混在する場合", () => {
      expect(formatAmount(10001.5)).toBe("1億1.5万円");
    });
  });

  describe("0の場合", () => {
    it("0万円を返す", () => {
      expect(formatAmount(0)).toBe("0万円");
    });
  });
});

describe("formatNumber", () => {
  it("カンマ区切りでフォーマットする", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000)).toBe("1,000,000");
  });

  it("1000未満はそのまま返す", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatUpdateTime", () => {
  it("ISO形式の日時をJST形式にフォーマットする", () => {
    // UTC 2025-01-15T05:30:00Z = JST 2025/01/15 14:30
    const result = formatUpdateTime("2025-01-15T05:30:00Z");
    expect(result).toContain("2025");
    expect(result).toContain("01");
    expect(result).toContain("15");
  });
});
