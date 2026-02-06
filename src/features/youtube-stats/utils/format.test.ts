import { formatNumberJa, formatNumberJaShort } from "./format";

describe("formatNumberJa", () => {
  describe("nullの場合", () => {
    it('null → "-" を返す', () => {
      expect(formatNumberJa(null)).toBe("-");
    });
  });

  describe("1万未満の場合", () => {
    it("0 はそのまま返す", () => {
      expect(formatNumberJa(0)).toBe("0");
    });

    it("9999 はカンマ区切りで返す", () => {
      expect(formatNumberJa(9999)).toBe("9,999");
    });

    it("1 はそのまま返す", () => {
      expect(formatNumberJa(1)).toBe("1");
    });

    it("1000 はカンマ区切りで返す", () => {
      expect(formatNumberJa(1000)).toBe("1,000");
    });
  });

  describe("1万以上1億未満の場合", () => {
    it("10000 → '1万'", () => {
      expect(formatNumberJa(10000)).toBe("1万");
    });

    it("15000 → '1.5万'", () => {
      expect(formatNumberJa(15000)).toBe("1.5万");
    });

    it("100000 → '10万'", () => {
      expect(formatNumberJa(100000)).toBe("10万");
    });

    it("1000000 → '100万'", () => {
      expect(formatNumberJa(1000000)).toBe("100万");
    });

    it("12300 → '1.2万' (小数第1位に丸める)", () => {
      expect(formatNumberJa(12300)).toBe("1.2万");
    });

    it("99990000 → '9999万'", () => {
      expect(formatNumberJa(99990000)).toBe("9999万");
    });
  });

  describe("1億以上の場合", () => {
    it("100000000 → '1億'", () => {
      expect(formatNumberJa(100000000)).toBe("1億");
    });

    it("120000000 → '1.2億'", () => {
      expect(formatNumberJa(120000000)).toBe("1.2億");
    });

    it("1000000000 → '10億'", () => {
      expect(formatNumberJa(1000000000)).toBe("10億");
    });
  });

  describe("負の数の場合", () => {
    it("-500 はカンマ区切りで返す", () => {
      expect(formatNumberJa(-500)).toBe("-500");
    });

    it("-10000 → '-1万'", () => {
      expect(formatNumberJa(-10000)).toBe("-1万");
    });

    it("-15000 → '-1.5万'", () => {
      expect(formatNumberJa(-15000)).toBe("-1.5万");
    });

    it("-100000000 → '-1億'", () => {
      expect(formatNumberJa(-100000000)).toBe("-1億");
    });

    it("-120000000 → '-1.2億'", () => {
      expect(formatNumberJa(-120000000)).toBe("-1.2億");
    });
  });
});

describe("formatNumberJaShort", () => {
  describe("1万未満の場合", () => {
    it("0 はそのまま返す", () => {
      expect(formatNumberJaShort(0)).toBe("0");
    });

    it("9999 はカンマ区切りで返す", () => {
      expect(formatNumberJaShort(9999)).toBe("9,999");
    });
  });

  describe("1万以上1億未満の場合（四捨五入、小数なし）", () => {
    it("10000 → '1万'", () => {
      expect(formatNumberJaShort(10000)).toBe("1万");
    });

    it("15000 → '2万' (四捨五入)", () => {
      expect(formatNumberJaShort(15000)).toBe("2万");
    });

    it("14999 → '1万' (四捨五入)", () => {
      expect(formatNumberJaShort(14999)).toBe("1万");
    });

    it("100000 → '10万'", () => {
      expect(formatNumberJaShort(100000)).toBe("10万");
    });

    it("1000000 → '100万'", () => {
      expect(formatNumberJaShort(1000000)).toBe("100万");
    });
  });

  describe("1億以上の場合（四捨五入、小数なし）", () => {
    it("100000000 → '1億'", () => {
      expect(formatNumberJaShort(100000000)).toBe("1億");
    });

    it("150000000 → '2億' (四捨五入)", () => {
      expect(formatNumberJaShort(150000000)).toBe("2億");
    });

    it("120000000 → '1億' (四捨五入)", () => {
      expect(formatNumberJaShort(120000000)).toBe("1億");
    });
  });

  describe("負の数の場合", () => {
    it("-500 はカンマ区切りで返す", () => {
      expect(formatNumberJaShort(-500)).toBe("-500");
    });

    it("-10000 → '-1万'", () => {
      expect(formatNumberJaShort(-10000)).toBe("-1万");
    });

    it("-100000000 → '-1億'", () => {
      expect(formatNumberJaShort(-100000000)).toBe("-1億");
    });
  });
});
