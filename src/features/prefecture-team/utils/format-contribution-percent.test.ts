import { formatContributionPercent } from "./format-contribution-percent";

describe("formatContributionPercent", () => {
  describe("0の場合", () => {
    it("0を返す", () => {
      expect(formatContributionPercent(0)).toBe("0");
    });
  });

  describe("0.1以上の場合", () => {
    it("小数点第1位までフォーマットする", () => {
      expect(formatContributionPercent(0.1)).toBe("0.1");
      expect(formatContributionPercent(0.15)).toBe("0.1"); // 切り捨て
      expect(formatContributionPercent(0.16)).toBe("0.2"); // 四捨五入
      expect(formatContributionPercent(1.5)).toBe("1.5");
      expect(formatContributionPercent(10.25)).toBe("10.3");
      expect(formatContributionPercent(100)).toBe("100.0");
    });
  });

  describe("0.01以上0.1未満の場合", () => {
    it("小数点第2位までフォーマットする", () => {
      expect(formatContributionPercent(0.01)).toBe("0.01");
      expect(formatContributionPercent(0.05)).toBe("0.05");
      expect(formatContributionPercent(0.099)).toBe("0.10");
      expect(formatContributionPercent(0.0479)).toBe("0.05");
    });
  });

  describe("0.001以上0.01未満の場合", () => {
    it("小数点第3位までフォーマットする", () => {
      expect(formatContributionPercent(0.001)).toBe("0.001");
      expect(formatContributionPercent(0.005)).toBe("0.005");
      expect(formatContributionPercent(0.0099)).toBe("0.010");
    });
  });

  describe("0.001未満の場合", () => {
    it("有効数字が出るまで桁数を増やす", () => {
      expect(formatContributionPercent(0.0001)).toBe("0.0001");
      expect(formatContributionPercent(0.00005)).toBe("0.00005");
      expect(formatContributionPercent(0.00001)).toBe("0.00001");
      expect(formatContributionPercent(0.000001)).toBe("0.000001");
    });

    it("極小値の場合は < 0.000001 を返す", () => {
      expect(formatContributionPercent(0.0000001)).toBe("< 0.000001");
      expect(formatContributionPercent(0.00000001)).toBe("< 0.000001");
    });
  });

  describe("実際のユースケース", () => {
    it("東京都での貢献度 (7150 / 14925900 * 100)", () => {
      const percent = (7150 / 14925900) * 100;
      expect(formatContributionPercent(percent)).toBe("0.05");
    });

    it("小規模県での高貢献度", () => {
      const percent = (10000 / 100000) * 100;
      expect(formatContributionPercent(percent)).toBe("10.0");
    });
  });
});
