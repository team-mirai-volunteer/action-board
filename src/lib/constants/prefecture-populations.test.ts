import {
  calculateXpPerCapita,
  getPopulationInTenThousand,
  PREFECTURE_POPULATIONS,
} from "./prefecture-populations";

describe("calculateXpPerCapita", () => {
  it("有効な都道府県のXPを正しく計算する", () => {
    // 東京都: 人口14,178,000 → XP 10000 → 10000 / 14178000 * 10000 = 7.0531...
    const result = calculateXpPerCapita(10000, "東京都");
    expect(result).toBe(Math.round((10000 / 14178000) * 10000 * 100) / 100);
  });

  it("異なる都道府県で正しく計算する", () => {
    // 鳥取県: 人口531,000 → XP 5000 → 5000 / 531000 * 10000 = 94.1620...
    const result = calculateXpPerCapita(5000, "鳥取県");
    expect(result).toBe(Math.round((5000 / 531000) * 10000 * 100) / 100);
  });

  it("大きなXP値でも正しく計算する", () => {
    const result = calculateXpPerCapita(1000000, "大阪府");
    expect(result).toBe(Math.round((1000000 / 8757000) * 10000 * 100) / 100);
  });

  it("XPが0の場合は0を返す", () => {
    const result = calculateXpPerCapita(0, "東京都");
    expect(result).toBe(0);
  });

  it("無効な都道府県名の場合は0を返す", () => {
    expect(calculateXpPerCapita(10000, "存在しない県")).toBe(0);
  });

  it("空文字の都道府県名の場合は0を返す", () => {
    expect(calculateXpPerCapita(10000, "")).toBe(0);
  });

  it("結果が小数点2桁に丸められる", () => {
    const result = calculateXpPerCapita(12345, "北海道");
    const resultStr = result.toString();
    const decimalPart = resultStr.split(".")[1];
    if (decimalPart) {
      expect(decimalPart.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("getPopulationInTenThousand", () => {
  it("東京都（最大人口）の人口を万人単位で返す", () => {
    // 東京都: 14,178,000人 → 1418万人
    expect(getPopulationInTenThousand("東京都")).toBe(1418);
  });

  it("鳥取県（最小人口）の人口を万人単位で返す", () => {
    // 鳥取県: 531,000人 → 53万人
    expect(getPopulationInTenThousand("鳥取県")).toBe(53);
  });

  it("北海道の人口を万人単位で返す", () => {
    // 北海道: 5,043,000人 → 504万人
    expect(getPopulationInTenThousand("北海道")).toBe(504);
  });

  it("大阪府の人口を万人単位で返す", () => {
    // 大阪府: 8,757,000人 → 876万人
    expect(getPopulationInTenThousand("大阪府")).toBe(876);
  });

  it("沖縄県の人口を万人単位で返す", () => {
    // 沖縄県: 1,466,000人 → 147万人
    expect(getPopulationInTenThousand("沖縄県")).toBe(147);
  });

  it("無効な都道府県名の場合は0を返す", () => {
    expect(getPopulationInTenThousand("存在しない県")).toBe(0);
  });

  it("空文字の場合は0を返す", () => {
    expect(getPopulationInTenThousand("")).toBe(0);
  });
});

describe("PREFECTURE_POPULATIONS", () => {
  it("47都道府県すべてのデータが含まれている", () => {
    expect(Object.keys(PREFECTURE_POPULATIONS).length).toBe(47);
  });

  it("すべての人口値が正の整数である", () => {
    for (const [prefecture, population] of Object.entries(
      PREFECTURE_POPULATIONS,
    )) {
      expect(population).toBeGreaterThan(0);
      expect(Number.isInteger(population)).toBe(true);
    }
  });
});
